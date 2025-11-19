import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SimpleChart = ({ data, type = 'bar', title, height = 300 }) => {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setIsMobile(window.innerWidth <= 768);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    const maxValue = Math.max(1, ...data.map(d => d.value)); // Ensure maxValue is at least 1 to avoid division by zero
    const chartHeight = isMobile ? 180 : height;

    const styles = {
        container: {
            backgroundColor: 'white',
            padding: isMobile ? '12px' : '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f3f4f6',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
        },
        title: {
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '600',
            marginBottom: isMobile ? '12px' : '20px',
            color: '#1f2937',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        chartArea: {
            position: 'relative',
            height: `${chartHeight}px`,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            gap: isMobile ? '2px' : '6px',
            paddingBottom: '40px',
            width: '100%',
        },
        bar: {
            position: 'relative',
            backgroundColor: '#3b82f6',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            flex: '1',
            maxWidth: isMobile ? '25px' : '40px',
            minWidth: isMobile ? '20px' : '30px',
            background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)'
        },
        barLabel: {
            position: 'absolute',
            bottom: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: isMobile ? '8px' : '10px',
            color: '#6b7280',
            whiteSpace: 'nowrap',
            fontWeight: '500',
            writingMode: isMobile && data.length > 4 ? 'vertical-rl' : 'horizontal-tb',
            textOrientation: 'mixed',
            maxWidth: '40px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        barValue: {
            position: 'absolute',
            top: '-18px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: isMobile ? '9px' : '11px',
            fontWeight: 'bold',
            color: '#1f2937',
            backgroundColor: '#f3f4f6',
            padding: '1px 3px',
            borderRadius: '3px',
            whiteSpace: 'nowrap'
        },
        pieContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '16px' : '32px',
            flexWrap: 'wrap',
            flexDirection: isMobile ? 'column' : 'row'
        },
        pieChart: {
            width: isMobile ? '120px' : '160px',
            height: isMobile ? '120px' : '160px',
            position: 'relative'
        },
        legend: {
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '4px' : '8px',
            fontSize: isMobile ? '10px' : '12px',
            maxWidth: '100%'
        },
        legendItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: 'wrap'
        },
        legendColor: {
            width: isMobile ? '12px' : '16px',
            height: isMobile ? '12px' : '16px',
            borderRadius: '3px',
            flexShrink: 0
        }
    };

    if (type === 'pie') {
        const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        let currentAngle = -90;

        return (
            <div ref={containerRef} style={styles.container}>
                <h3 style={styles.title}>{title}</h3>
                <div style={styles.pieContainer}>
                    <svg viewBox="0 0 200 200" style={styles.pieChart}>
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const angle = (percentage / 100) * 360;
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            const startX = 100 + 80 * Math.cos(startAngle * Math.PI / 180);
                            const startY = 100 + 80 * Math.sin(startAngle * Math.PI / 180);
                            const endX = 100 + 80 * Math.cos(endAngle * Math.PI / 180);
                            const endY = 100 + 80 * Math.sin(endAngle * Math.PI / 180);
                            currentAngle = endAngle;
                            return (
                                <path
                                    key={index}
                                    d={`M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                    fill={colors[index % colors.length]}
                                    stroke="white"
                                    strokeWidth="3"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                />
                            );
                        })}
                    </svg>
                    <div style={styles.legend}>
                        {data.map((item, index) => (
                            <div key={index} style={styles.legendItem}>
                                <div style={{
                                    ...styles.legendColor,
                                    backgroundColor: colors[index % colors.length]
                                }}></div>
                                <span style={{ color: '#4b5563', fontSize: 'inherit' }}>
                                    {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={styles.container}>
            <h3 style={styles.title}>{title}</h3>
            <div style={styles.chartArea}>
                {data.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.bar,
                            height: `${(item.value / maxValue) * (chartHeight - 60)}px`,
                            backgroundColor: item.color || '#3b82f6'
                        }}
                    >
                        <span style={styles.barValue}>{item.value}</span>
                        <span style={styles.barLabel}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleChart;