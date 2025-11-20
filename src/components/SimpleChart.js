import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const RechartsCharts = ({ data, type = 'bar', title, height = 300 }) => {
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
        chartWrapper: {
            width: '100%',
            height: `${chartHeight}px`
        }
    };

    const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
    if (type === 'pie') {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const pieData = data.map((item,index) => ({
            ...item, 
            name : item.label,
            fill: item.color || defaultColors[index % defaultColors.length],
            total: total
        }));

        return (
            <div ref={containerRef} style={styles.container}>
                <h3 style={styles.title}>{title}</h3>
                <div style={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={isMobile ? 60 : 80}
                                fill="#8884d8"
                                dataKey="value"
                                // activeShape={renderActiveShape} // Can be added for interactivity
                            >
                                {pieData.map((entry, index) => (
                                    <Sector
                                        key={`sector-${index}`}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={isMobile ? 40 : 50}
                                        outerRadius={isMobile ? 60 : 80}
                                        startAngle={0} // These will be calculated by Recharts
                                        endAngle={0} // These will be calculated by Recharts
                                        fill={entry.fill}
                                        stroke="white"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                layout={isMobile ? 'horizontal' : 'vertical'}
                                align={isMobile ? 'center' : 'right'}
                                verticalAlign={isMobile ? 'bottom' : 'middle'}
                                wrapperStyle={{
                                    paddingLeft: isMobile ? 0 : 20,
                                    paddingTop: isMobile ? 10 : 0
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
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

export default RechartsCharts;