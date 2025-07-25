export const scanReceipt = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    try {
        const response = await fetch('/api/scan', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            console.error('API or Server Error:', data);
            throw new Error(data.message || 'Failed to process receipt via proxy.');
        }
        return {
            orderNumber: data.orderNumber,
            orderTotal: data.orderTotal,
        };
    } catch (error) {
        console.error("Error calling backend for scanning:", error);
        throw error;
    }
};