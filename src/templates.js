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
            highKey: 0,
            contrast: 4
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
            highKey: -2,
            contrast: 2
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
            highKey: 1,
            contrast: -1
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
            highKey: 0,
            contrast: 2
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
            highKey: 0,
            contrast: 3
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
            highKey: -1,
            contrast: 1
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
            highKey: 1,
            contrast: 4
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
            highKey: 2,
            contrast: -1
        },
        description: '明亮清新的日系風格',
        tags: ['日系', '清新', '明亮']
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
