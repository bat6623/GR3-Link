// GR3 Link - 預設濾鏡範本庫
// 常見場景的推薦參數設定

export const defaultTemplates = [
    {
        id: 'template-1',
        name: '街拍高對比',
        baseEffect: 'Positive Film',
        params: {
            saturation: 2,
            hue: 0,
            highLowKey: 0,
            contrast: 4,
            contrastHighlight: 0,
            contrastShadow: 0,
            sharpness: 1,
            clarity: 0,
            toning: 'Off',
            filterEffect: 0,
            shading: 0,
            grainEffect: 0
        },
        description: '適合城市街拍，強烈的對比度突顯建築線條',
        tags: ['街拍', '城市', '高對比']
    },
    {
        id: 'template-2',
        name: '夜景低噪點',
        baseEffect: 'Negative Film',
        params: {
            saturation: -1,
            hue: 0,
            highLowKey: -2,
            contrast: 2,
            contrastHighlight: 0,
            contrastShadow: 0,
            sharpness: 0,
            clarity: -1,
            toning: 'Off',
            filterEffect: 0,
            shading: 0,
            grainEffect: 0,
            highISONoiseReduction: true
        },
        description: '夜間拍攝，降低飽和度減少噪點',
        tags: ['夜景', '低噪點']
    },
    {
        id: 'template-3',
        name: '人像柔和',
        baseEffect: 'Soft Monotone',
        params: {
            saturation: 1,
            hue: 1,
            highLowKey: 1,
            contrast: -1,
            contrastHighlight: -1,
            contrastShadow: 0,
            sharpness: 0,
            clarity: -1,
            toning: 'Off',
            filterEffect: 0,
            shading: -1,
            grainEffect: 0,
            highlightCorrection: true
        },
        description: '柔和的色調適合人像拍攝',
        tags: ['人像', '柔和']
    },
    {
        id: 'template-4',
        name: '風景飽和',
        baseEffect: 'Positive Film',
        params: {
            saturation: 4,
            hue: -1,
            highLowKey: 0,
            contrast: 2,
            contrastHighlight: 0,
            contrastShadow: 0,
            sharpness: 2,
            clarity: 2,
            toning: 'Off',
            filterEffect: 0,
            shading: 0,
            grainEffect: 0,
            peripheralIlluminationCorrection: true
        },
        description: '鮮豔的色彩呈現自然風景',
        tags: ['風景', '飽和', '自然']
    },
    {
        id: 'template-5',
        name: '黑白經典',
        baseEffect: 'Hi-Contrast B&W',
        params: {
            saturation: 0,
            hue: 0,
            highLowKey: 0,
            contrast: 3,
            contrastHighlight: 0,
            contrastShadow: 0,
            sharpness: 2,
            clarity: 1,
            toning: 'Off',
            filterEffect: 2,
            shading: 0,
            grainEffect: 1
        },
        description: '經典黑白高對比，適合紀實攝影',
        tags: ['黑白', '紀實', '經典']
    },
    {
        id: 'template-6',
        name: '復古膠片',
        baseEffect: 'Retro',
        params: {
            saturation: 2,
            hue: 2,
            highLowKey: -1,
            contrast: 1,
            contrastHighlight: 0,
            contrastShadow: 0,
            sharpness: 0,
            clarity: 0,
            toning: 'Sepia',
            filterEffect: 0,
            shading: -2,
            grainEffect: 2,
            peripheralIlluminationCorrection: false
        },
        description: '模擬復古膠片的色調和質感',
        tags: ['復古', '膠片', '懷舊']
    },
    {
        id: 'template-7',
        name: '漂白效果',
        baseEffect: 'Bleach Bypass',
        params: {
            saturation: -2,
            hue: 0,
            highLowKey: 1,
            contrast: 4,
            contrastHighlight: -2,
            contrastShadow: -2,
            sharpness: 1,
            clarity: 2,
            toning: 'Off',
            filterEffect: 0,
            shading: 0,
            grainEffect: 0
        },
        description: '低飽和高對比的漂白效果',
        tags: ['漂白', '低飽和']
    },
    {
        id: 'template-8',
        name: '日系清新',
        baseEffect: 'Positive Film',
        params: {
            saturation: 1,
            hue: 1,
            highLowKey: 2,
            contrast: -1,
            contrastHighlight: 0,
            contrastShadow: 0,
            sharpness: 0,
            clarity: 0,
            toning: 'Off',
            filterEffect: 0,
            shading: -1,
            grainEffect: 0,
            highlightCorrection: true,
            shadowCorrection: 'Low'
        },
        description: '明亮清新的日系風格',
        tags: ['日系', '清新', '明亮']
    },
    // 新增：用戶提供的 BW Monotone 範本
    {
        id: 'template-9',
        name: 'BW Monotone 經典',
        baseEffect: 'BW Monotone',
        params: {
            saturation: 0,
            hue: 0,
            highLowKey: 3,
            contrast: 4,
            contrastHighlight: -4,
            contrastShadow: -4,
            sharpness: 1,
            clarity: 2,
            toning: 'Off',
            filterEffect: 2,
            shading: -1,
            grainEffect: 1,
            highlightCorrection: true,
            shadowCorrection: 'Low',
            peripheralIlluminationCorrection: true,
            highISONoiseReduction: false,
            whiteBalance: 'Auto',
            wbCompensationA: 0,
            wbCompensationM: 0,
            isoMax: 6400,
            exposureCompensation: '+1/3'
        },
        description: '經典黑白單色調設定，高對比度搭配細節保留，適合紀實與街拍',
        tags: ['黑白', '單色', '紀實', '街拍', '高對比']
    }
];

// 初始化預設範本到 localStorage
export function initializeTemplates(store) {
    // 檢查是否已經初始化過
    const initialized = localStorage.getItem('templates_initialized');

    if (!initialized) {
        console.log('Initializing default templates...');
        defaultTemplates.forEach(template => {
            // 檢查是否已存在
            const existing = store.getAll().find(r => r.id === template.id);
            if (!existing) {
                store.add(template);
            }
        });
        localStorage.setItem('templates_initialized', 'true');
        console.log('Default templates initialized');
    }
}
