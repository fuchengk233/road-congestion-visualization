import * as React from 'react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { DatePicker, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import './App.css';

// 导入数据
import { data as roadData, type RoadData } from './data';
import { congestionData, type CongestionData } from './yongdu';

// 定义地图容器类型
interface MapContainer extends HTMLElement {
  __map__?: any;
}

// 定义地图事件类型
interface MapEvent {
  lnglat: {
    lng: number;
    lat: number;
  };
}

declare global {
  interface Window {
    AMap: any;
    AMapLoaded: boolean;
  }
}

function App() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);
  const [hoveredRoadId, setHoveredRoadId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs('2019-09-01 00:00'));
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const mapInstanceRef = useRef<any>(null);
  const polylinesRef = useRef<{ [key: string]: any }>({});

  // 添加调试信息函数
  const addDebugInfo = useCallback((message: string) => {
    setDebugInfo(prev => {
      const timestamp = new Date().toLocaleTimeString();
      const newInfo = `${timestamp}: ${message}`;
      console.log(newInfo); // 同时在控制台输出
      return [newInfo, ...prev.slice(0, 49)]; // 保留最近50条日志
    });
  }, []);

  // 解析 WKT 坐标字符串
  const parseWKT = useCallback((wkt: string) => {
    try {
      // 提取 WKT 类型和坐标部分
      const match = wkt.match(/^(\w+)\s*\((.*)\)$/);
      if (!match) {
        throw new Error('无效的 WKT 格式');
      }

      const [, type, coordsStr] = match;
      const segments: number[][][] = [];

      if (type === 'LINESTRING') {
        // 解析 LINESTRING
        const points = coordsStr.split(',').map(point => {
          const [lng, lat] = point.trim().split(/\s+/).map(Number);
          if (isNaN(lng) || isNaN(lat)) {
            throw new Error(`无效的坐标值: ${point}`);
          }
          if (lng < 73 || lng > 135 || lat < 18 || lat > 53) {
            throw new Error(`坐标超出中国范围: ${lng}, ${lat}`);
          }
          return [lng, lat];
        });

        if (points.length < 2) {
          throw new Error(`坐标点数量不足: ${points.length}个点`);
        }

        // 移除重复点
        const uniquePoints = points.reduce((acc, point) => {
          const key = point.join(',');
          if (!acc.has(key)) {
            acc.set(key, point);
          }
          return acc;
        }, new Map<string, number[]>());

        const uniquePointsArray = Array.from(uniquePoints.values());
        if (uniquePointsArray.length < 2) {
          throw new Error('移除重复点后坐标点数量不足');
        }

        segments.push(uniquePointsArray);
      } else if (type === 'MULTILINESTRING') {
        // 解析 MULTILINESTRING
        const lineStrings = coordsStr.split('),(').map(str => 
          str.replace(/^\(|\)$/g, '').trim()
        );

        for (let i = 0; i < lineStrings.length; i++) {
          const lineStr = lineStrings[i];
          const points = lineStr.split(',').map(point => {
            const [lng, lat] = point.trim().split(/\s+/).map(Number);
            if (isNaN(lng) || isNaN(lat)) {
              throw new Error(`线段 ${i + 1} 中的无效坐标值: ${point}`);
            }
            if (lng < 73 || lng > 135 || lat < 18 || lat > 53) {
              throw new Error(`线段 ${i + 1} 中的坐标超出中国范围: ${lng}, ${lat}`);
            }
            return [lng, lat];
          });

          if (points.length < 2) {
            addDebugInfo(`警告: 线段 ${i + 1} 坐标点数量不足，已跳过`);
            continue;
          }

          // 移除重复点
          const uniquePoints = points.reduce((acc, point) => {
            const key = point.join(',');
            if (!acc.has(key)) {
              acc.set(key, point);
            }
            return acc;
          }, new Map<string, number[]>());

          const uniquePointsArray = Array.from(uniquePoints.values());
          if (uniquePointsArray.length >= 2) {
            segments.push(uniquePointsArray);
          } else {
            addDebugInfo(`警告: 线段 ${i + 1} 移除重复点后坐标点数量不足，已跳过`);
          }
        }

        if (segments.length === 0) {
          throw new Error('没有有效的线段');
        }
      } else {
        throw new Error(`不支持的 WKT 类型: ${type}`);
      }

      return {
        type,
        segments,
        coordinates: segments[0] // 使用第一个线段作为主要坐标
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`WKT 解析错误: ${errorMessage}`);
    }
  }, []);

  // 解析路段数据
  const parsedRoadData = useMemo(() => {
    addDebugInfo('开始解析路段数据...');
    try {
      const data = roadData.map(road => {
        try {
          if (!road.WKT) {
            throw new Error('缺少 WKT 数据');
          }

          const parsed = parseWKT(road.WKT);
          
          // 输出路段信息用于调试
          addDebugInfo(
            `解析路段: ${road.NAME} (ID: ${road.ID}), ` +
            `方向: ${road.DIRECTION}, ` +
            `坐标点数量: ${parsed.coordinates.length}, ` +
            `WKT类型: ${parsed.type}, ` +
            `线段数量: ${parsed.segments.length}`
          );

          return {
            ...road,
            coordinates: parsed.coordinates,
            segments: parsed.segments
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          addDebugInfo(`警告: 解析路段 ${road.NAME} (ID: ${road.ID}) 时出错: ${errorMessage}`);
          return null;
        }
      }).filter((road): road is RoadData & { coordinates: number[][], segments: number[][][] } => 
        road !== null && road.coordinates.length >= 2
      );

      // 统计不同方向的路段
      const roadStats = data.reduce((acc, road) => {
        const key = `${road.NAME}-${road.DIRECTION}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 输出路段统计信息
      addDebugInfo('路段统计信息:');
      Object.entries(roadStats).forEach(([key, count]) => {
        addDebugInfo(`${key}: ${count}条`);
      });

      addDebugInfo(`路段数据解析完成，共 ${data.length} 条有效路段`);
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      addDebugInfo(`错误: 解析路段数据时出错: ${errorMessage}`);
      return [];
    }
  }, [roadData, addDebugInfo, parseWKT]);

  // 处理鼠标悬停事件
  const handleMouseOver = useCallback((roadId: string) => {
    const polyline = polylinesRef.current[roadId];
    if (polyline) {
      polyline.setOptions({
        strokeWeight: 7,
        strokeColor: '#FF7875',
        strokeOpacity: 1
      });
    }
    setHoveredRoadId(roadId);
  }, []);

  // 处理鼠标移出事件
  const handleMouseOut = useCallback((roadId: string) => {
    const polyline = polylinesRef.current[roadId];
    if (polyline) {
      const road = parsedRoadData.find(r => r.ID === roadId);
      if (road) {
        const timeStr = selectedTime.format('YYYY-MM-DD HH:mm');
        const currentCongestion = congestionData.find(d => d.ts === timeStr);
        const congestionIndex = Number(currentCongestion?.[roadId]);
        
        let color = '#FF4D4F';
        if (!isNaN(congestionIndex)) {
          if (congestionIndex < 2) {
            color = '#52C41A';
          } else if (congestionIndex < 4) {
            color = '#FAAD14';
          } else if (congestionIndex < 6) {
            color = '#FF7A45';
          }
        }

        polyline.setOptions({
          strokeWeight: 5,
          strokeColor: color,
          strokeOpacity: 0.9
        });
      }
    }
    setHoveredRoadId(null);
  }, [selectedTime, parsedRoadData]);

  // 处理路段点击事件
  const handleRoadClick = useCallback((road: RoadData & { segments: number[][][] }, polyline: any, e: MapEvent) => {
    const timeStr = selectedTime.format('YYYY-MM-DD HH:mm');
    const currentCongestion = congestionData.find(d => d.ts === timeStr);
    const congestionValue = currentCongestion ? currentCongestion[road.ID] : undefined;
    const congestionIndex = typeof congestionValue === 'string' ? Number(congestionValue) : undefined;
    
    // 获取拥堵状态描述
    let congestionStatus = '暂无数据';
    let congestionColor = '#999999';
    if (typeof congestionIndex === 'number' && !isNaN(congestionIndex)) {
      if (congestionIndex < 2) {
        congestionStatus = '畅通';
        congestionColor = '#52C41A';
      } else if (congestionIndex < 4) {
        congestionStatus = '轻度拥堵';
        congestionColor = '#FAAD14';
      } else if (congestionIndex < 6) {
        congestionStatus = '中度拥堵';
        congestionColor = '#FF7A45';
      } else {
        congestionStatus = '严重拥堵';
        congestionColor = '#FF4D4F';
      }
    }

    const infoWindow = new window.AMap.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #FF4D4F;">${road.NAME}</h3>
          <p style="margin: 5px 0;"><strong>方向：</strong>${road.DIRECTION}</p>
          <p style="margin: 5px 0;"><strong>起点：</strong>${road.FNAME || '未知'}</p>
          <p style="margin: 5px 0;"><strong>终点：</strong>${road.TNAME || '未知'}</p>
          <p style="margin: 5px 0;"><strong>长度：</strong>${(Number(road.LENGTH) / 1000).toFixed(2)}公里</p>
          <p style="margin: 5px 0;"><strong>线段数量：</strong>${road.segments.length}</p>
          <p style="margin: 5px 0;"><strong>总坐标点数量：</strong>${road.segments.reduce((sum, seg) => sum + seg.length, 0)}</p>
          <p style="margin: 5px 0;"><strong>路段ID：</strong>${road.ID}</p>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="margin: 5px 0;"><strong>当前时间：</strong>${timeStr}</p>
            <p style="margin: 5px 0;">
              <strong>拥堵状态：</strong>
              <span style="color: ${congestionColor}; font-weight: bold;">
                ${congestionStatus}
                ${typeof congestionIndex === 'number' && !isNaN(congestionIndex) ? `(${congestionIndex.toFixed(1)})` : ''}
              </span>
            </p>
          </div>
        </div>
      `,
      offset: new window.AMap.Pixel(0, -30)
    });
    infoWindow.open(mapInstanceRef.current, e.lnglat);
    setSelectedRoadId(road.ID);
  }, [selectedTime]);

  // 更新路段样式
  const updateRoadStyle = useCallback((roadId: string, polyline: any) => {
    const road = parsedRoadData.find(r => r.ID === roadId);
    if (road) {
      const timeStr = selectedTime.format('YYYY-MM-DD HH:mm');
      const currentCongestion = congestionData.find(d => d.ts === timeStr);
      const congestionIndex = Number(currentCongestion?.[roadId]);
      
      let color = '#FF4D4F';
      if (!isNaN(congestionIndex)) {
        if (congestionIndex < 2) {
          color = '#52C41A';
        } else if (congestionIndex < 4) {
          color = '#FAAD14';
        } else if (congestionIndex < 6) {
          color = '#FF7A45';
        }
      }

      // 设置路段样式
      polyline.setOptions({
        strokeWeight: roadId === selectedRoadId ? 7 : 5,
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50,
        showDir: true,
        dirColor: '#FF7875',
        isOutline: true,
        outlineColor: '#FFFFFF'
      });
    }
  }, [selectedTime, selectedRoadId, parsedRoadData]);

  // 更新所有路段样式
  const updateRoadStyles = useCallback((time: Dayjs) => {
    if (!mapInstanceRef.current) return;

    const timeStr = time.format('YYYY-MM-DD HH:mm');
    const currentCongestion = congestionData.find(d => d.ts === timeStr);
    
    if (!currentCongestion) {
      addDebugInfo(`未找到时间 ${timeStr} 的拥堵数据`);
      return;
    }

    // 批量更新样式
    const updates = Object.entries(polylinesRef.current).map(([key, polyline]) => {
      const roadId = key.split('-')[0];
      const congestionIndex = Number(currentCongestion[roadId]);
      if (!isNaN(congestionIndex)) {
        let color = '#FF4D4F';
        if (congestionIndex < 2) {
          color = '#52C41A';
        } else if (congestionIndex < 4) {
          color = '#FAAD14';
        } else if (congestionIndex < 6) {
          color = '#FF7A45';
        }

        return () => polyline.setOptions({
          strokeColor: color,
          strokeWeight: roadId === selectedRoadId ? 7 : 5,
          strokeOpacity: 0.9
        });
      }
      return null;
    }).filter(Boolean);

    // 使用 requestAnimationFrame 分批更新
    const batchSize = 50;
    const updateBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + batchSize, updates.length);
      for (let i = startIndex; i < endIndex; i++) {
        updates[i]?.();
      }
      if (endIndex < updates.length) {
        requestAnimationFrame(() => updateBatch(endIndex));
      }
    };
    updateBatch(0);
  }, [selectedRoadId]);

  // 处理时间选择
  const handleTimeChange = useCallback((time: Dayjs | null) => {
    if (time) {
      setSelectedTime(time);
      addDebugInfo(`选择时间: ${time.format('YYYY-MM-DD HH:mm')}`);
      // 只更新路段样式，不重新加载地图
      if (mapInstanceRef.current) {
        updateRoadStyles(time);
      }
    }
  }, [updateRoadStyles]);

  // 禁用日期
  const disabledDate = useCallback((current: Dayjs) => {
    return current && (current < dayjs('2019-09-01') || current > dayjs('2019-09-30'));
  }, []);

  // 禁用时间
  const disabledDateTime = useCallback((current: Dayjs) => {
    if (current && current.date() === 1) {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(h => h < 0 || h > 23),
        disabledMinutes: () => Array.from({ length: 60 }, (_, i) => i).filter(m => m < 0 || m > 59)
      };
    }
    return {
      disabledHours: () => [],
      disabledMinutes: () => []
    };
  }, []);

  // 禁用分钟
  const disabledMinutes = useCallback((hour: number) => {
    if (selectedTime && selectedTime.date() === 1) {
      return Array.from({ length: 60 }, (_, i) => i).filter(m => m < 0 || m > 59);
    }
    return [];
  }, [selectedTime]);

  // 初始化地图
  useEffect(() => {
    let isInitializing = true;
    addDebugInfo('组件挂载，开始初始化...');
    addDebugInfo(`当前路段数据数量: ${parsedRoadData.length}`);
    setLoading(true);
    setLoadingProgress(0);

    const checkAMap = () => {
      if (window.AMapLoaded && isInitializing) {
        addDebugInfo('高德地图API加载完成，开始初始化地图...');
        initMap();
      } else if (isInitializing) {
        setTimeout(checkAMap, 100);
      }
    };

    const initMap = () => {
      try {
        if (!isInitializing) return;

        const container = document.getElementById('container');
        if (!container) {
          throw new Error('找不到地图容器元素');
        }

        // 如果已经存在地图实例，先销毁它
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }

        const map = new window.AMap.Map(container, {
          zoom: 14,
          center: [116.483, 39.99],
          viewMode: '3D',
          mapStyle: 'amap://styles/normal',
          pitch: 50,
          rotation: 0,
          features: ['bg', 'road', 'building'],
          buildingAnimation: true,
          expandZoomRange: true,
          zooms: [3, 20]
        });

        mapInstanceRef.current = map;
        addDebugInfo('地图实例创建成功');

        // 添加地图控件
        map.addControl(new window.AMap.ToolBar({ position: 'RB' }));
        map.addControl(new window.AMap.Scale({ position: 'LB' }));
        map.addControl(new window.AMap.MapType({ position: 'RT' }));
        map.addControl(new window.AMap.HawkEye({ isOpen: false, position: 'RB' }));
        map.addControl(new window.AMap.Geolocation({ position: 'RB' }));
        addDebugInfo('地图控件添加完成');

        // 批量创建路段
        const totalRoads = parsedRoadData.length;
        addDebugInfo(`开始添加路段，总数: ${totalRoads}`);
        
        if (totalRoads === 0) {
          addDebugInfo('警告: 没有路段数据可添加');
          setLoading(false);
          return;
        }

        const batchSize = 20;
        let processedCount = 0;
        let isProcessing = true;

        const processBatch = (startIndex: number) => {
          if (!isProcessing || !isInitializing) return;

          const endIndex = Math.min(startIndex + batchSize, totalRoads);
          const batch = parsedRoadData.slice(startIndex, endIndex);
          addDebugInfo(`处理第 ${startIndex + 1} 到 ${endIndex} 条路段`);

          batch.forEach((road) => {
            if (!isProcessing || !isInitializing) return;

            try {
              if (road.segments && road.segments.length > 0 && mapInstanceRef.current) {
                road.segments.forEach((segment, index) => {
                  if (segment.length >= 2) {
                    const validCoordinates = segment.filter(coord => 
                      Array.isArray(coord) && 
                      coord.length === 2 && 
                      !isNaN(coord[0]) && 
                      !isNaN(coord[1]) &&
                      coord[0] >= 73 && coord[0] <= 135 &&
                      coord[1] >= 18 && coord[1] <= 53
                    );

                    if (validCoordinates.length < 2) {
                      addDebugInfo(`警告: 路段 ${road.NAME} 的线段 ${index + 1} 没有足够的有效坐标点`);
                      return;
                    }

                    const polyline = new window.AMap.Polyline({
                      path: validCoordinates,
                      strokeColor: '#FF4D4F',
                      strokeWeight: 5,
                      strokeOpacity: 0.9,
                      borderWeight: 2,
                      strokeStyle: 'solid',
                      lineJoin: 'round',
                      lineCap: 'round',
                      zIndex: 50,
                      showDir: true,
                      dirColor: '#FF7875',
                      isOutline: true,
                      outlineColor: '#FFFFFF',
                      extData: {
                        id: road.ID,
                        name: road.NAME,
                        direction: road.DIRECTION,
                        fname: road.FNAME,
                        tname: road.TNAME,
                        length: road.LENGTH,
                        segmentIndex: index
                      }
                    });

                    polyline.setMap(mapInstanceRef.current);
                    
                    const polylineKey = `${road.ID}-${index}`;
                    polylinesRef.current[polylineKey] = polyline;
                    
                    addDebugInfo(`成功添加路段: ${road.NAME} 的线段 ${index + 1}, 坐标点数量: ${validCoordinates.length}`);

                    polyline.on('mouseover', () => handleMouseOver(road.ID));
                    polyline.on('mouseout', () => handleMouseOut(road.ID));
                    polyline.on('click', (e: MapEvent) => handleRoadClick(road, polyline, e));
                  }
                });
              } else {
                addDebugInfo(`警告: 路段 ${road.NAME} 没有有效的坐标数据或地图实例不可用`);
              }
            } catch (error) {
              addDebugInfo(`错误: 处理路段 ${road.NAME} 时出错: ${error instanceof Error ? error.message : '未知错误'}`);
            }
          });

          processedCount += batch.length;
          const progress = Math.round((processedCount / totalRoads) * 100);
          setLoadingProgress(progress);
          addDebugInfo(`路段添加进度: ${progress}%`);

          if (endIndex < totalRoads && isProcessing && isInitializing) {
            requestAnimationFrame(() => processBatch(endIndex));
          } else {
            if (isInitializing) {
              updateRoadStyles(selectedTime);
              setLoading(false);
              setMapLoaded(true);
              addDebugInfo('地图初始化完成');
            }
          }
        };

        processBatch(0);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '地图初始化失败';
        addDebugInfo(`错误: ${errorMessage}`);
        setError(errorMessage);
        setLoading(false);
      }
    };

    checkAMap();

    return () => {
      isInitializing = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      polylinesRef.current = {};
    };
  }, [parsedRoadData, addDebugInfo, handleRoadClick, handleMouseOver, handleMouseOut]);

  return (
    <div className="app-container">
      <div className="time-picker-container">
        <DatePicker
          showTime={{
            format: 'HH:mm',
            minuteStep: 10,
            disabledMinutes,
            hideDisabledOptions: true,
          }}
          format="YYYY-MM-DD HH:mm"
          value={selectedTime}
          onChange={handleTimeChange}
          disabledDate={disabledDate}
          disabledTime={disabledDateTime}
          allowClear={false}
          placeholder="选择时间"
        />
      </div>
      <div id="container" className="map-container"></div>
      {loading && (
        <div className="loading">
          <Spin size="large" />
          <div style={{ marginTop: '10px' }}>正在加载地图...</div>
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
            加载进度: {loadingProgress}%
          </div>
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
            {debugInfo.slice(-3).join('\n')}
          </div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      <div className="debug-info">
        {debugInfo.map((info, index) => (
          <div key={index}>{info}</div>
        ))}
      </div>
    </div>
  );
}

export default App; 