import React, { useState, useEffect } from 'react';

const ResponsiveTable = ({ headers, data, onImageClick }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return (
            <div style={{ width: '100%' }}>
                {data.map((row, rowIndex) => (
                    <div key={rowIndex} style={{
                        backgroundColor: '#f8fafc',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        {row.map((cell, cellIndex) => (
                            <div key={cellIndex} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: cellIndex < row.length - 1 ? '1px solid #e2e8f0' : 'none'
                            }}>
                                <span style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: '13px',
                                    flex: '0 0 auto',
                                    marginRight: '12px'
                                }}>
                                    {headers[cellIndex]}:
                                </span>
                                <div style={{ flex: '1', textAlign: 'right' }}>
                                    {cell && typeof cell === 'object' && cell.type === 'image' ? (
                                        <img
                                            src={cell.value}
                                            alt="Order"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => onImageClick && onImageClick(cell.value)}
                                        />
                                    ) : cell && typeof cell === 'object' && cell.type === 'status' ? (
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            backgroundColor: cell.value >= 0 ? '#d1fae5' : '#fee2e2',
                                            color: cell.value >= 0 ? '#065f46' : '#991b1b'
                                        }}>
                                            {cell.display}
                                        </span>
                                    ) : (
                                        <span style={{
                                            fontSize: '13px',
                                            color: '#1f2937',
                                            wordBreak: 'break-word'
                                        }}>
                                            {cell}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={{
            overflowX: 'auto',
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            WebkitOverflowScrolling: 'touch'
        }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '600px'
            }}>
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} style={{
                                backgroundColor: '#f9fafb',
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: '#4b5563',
                                borderBottom: '2px solid #e5e7eb',
                                whiteSpace: 'nowrap'
                            }}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} style={{ transition: 'background-color 0.2s ease' }}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} style={{
                                    padding: '12px',
                                    borderBottom: '1px solid #f3f4f6',
                                    fontSize: '14px',
                                    color: '#1f2937'
                                }}>
                                    {cell && typeof cell === 'object' && cell.type === 'image' ? (
                                        <img
                                            src={cell.value}
                                            alt="Order"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s ease'
                                            }}
                                            onClick={() => onImageClick && onImageClick(cell.value)}
                                        />
                                    ) : cell && typeof cell === 'object' && cell.type === 'status' ? (
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            backgroundColor: cell.value >= 0 ? '#d1fae5' : '#fee2e2',
                                            color: cell.value >= 0 ? '#065f46' : '#991b1b',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {cell.display}
                                        </span>
                                    ) : (
                                        cell
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResponsiveTable;