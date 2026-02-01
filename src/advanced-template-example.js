// GR3 Link - 完整參數範本範例
// 基於用戶提供的 BW Monotone 設定

export const advancedTemplate = {
    id: 'template-bw-monotone',
    name: 'BW Monotone 經典',
    baseEffect: 'BW Monotone',
    params: {
        // 色調與對比
        saturation: 0,  // BW 模式不適用
        hue: 0,
        highLowKey: 3,  // High/Low Key: +3
        contrast: 4,  // Contrast: +4
        contrastHighlight: -4,  // Contrast (Highlight): -4
        contrastShadow: -4,  // Contrast (Shadow): -4

        // 銳利度與細節
        sharpness: 1,  // Sharpness: +1
        clarity: 2,  // Clarity: +2

        // 濾鏡效果
        toning: 'Off',  // Toning: Off
        filterEffect: 2,  // Filter Effect: 2
        shading: -1,  // Shading: -1
        grainEffect: 1,  // Grain Effect: 1

        // 校正選項
        highlightCorrection: true,  // Highlight Correction: On
        shadowCorrection: 'Low',  // Shadow Correction: Low
        peripheralIlluminationCorrection: true,  // Peripheral Illumination Correction: On
        highISONoiseReduction: false,  // High-ISO Noise Reduction: Off

        // 白平衡
        whiteBalance: 'Auto',  // White Balance: Auto
        wbCompensationA: 0,  // WB Compensation: A:0
        wbCompensationM: 0,  // WB Compensation: M:0

        // 曝光設定
        isoMax: 6400,  // ISO: up to ISO 6400
        exposureCompensation: '+1/3'  // Exposure Compensation: +1/3 to +2/3 (typically)
    },
    description: '經典黑白單色調設定，高對比度搭配細節保留，適合紀實與街拍',
    tags: ['黑白', '單色', '紀實', '街拍', '高對比']
};
