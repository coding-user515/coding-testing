// STORE.JS - SKIN STORE SYSTEM (150+ lines)
const birdImages = {};
const skins = [
    {name:"Classic Bird", file:"Picsart_26-02-26_17-30-25-252.png", unlockScore:0, pipeColor:"#00c853", groundColor:"#8B4513"},
    {name:"Mango Bird", file:"Picsart_26-02-27_01-28-33-302.png", unlockScore:10, pipeColor:"#FFA500", groundColor:"#FFCC80"},
    {name:"Happy Parrot", file:"Picsart_26-02-27_10-16-34-761.png", unlockScore:20, pipeColor:"#ff4081", groundColor:"#f48fb1"},
    {name:"Angry Bird", file:"Picsart_26-02-27_10-15-45-688.png", unlockScore:30, pipeColor:"#ff1744", groundColor:"#d50000"},
    {name:"Shadow Crow", file:"Picsart_26-02-27_20-37-59-368.png", unlockScore:50, pipeColor:"#333333", groundColor:"#555555"}
];


let skinData = JSON.parse(localStorage.getItem("fluppySkins")) || {};
let selectedSkinName = localStorage.getItem("selectedSkin") || "Classic Bird";
let selectedSkin = skins.find(s => s.name === selectedSkinName) || skins[0];

function preloadSkinImages() {
    skins.forEach(skin => {
        birdImages[skin.name] = new Image();
        birdImages[skin.name].src = skin.file;
    });
}

function renderSkins() {
    const skinRow = document.getElementById('skinRow');
    const currentSkinPreview = document.getElementById('currentSkinPreview');
    const confirmBtn = document.getElementById('confirmSkinBtn');
    
    // Current skin preview
    currentSkinPreview.innerHTML = `
        <h3>Current Skin</h3>
        <img src="${selectedSkin.file}" style="width:160px;height:160px;border-radius:20px;border:4px solid #ddd;">
        <div style="font-weight:bold;margin-top:10px;">${selectedSkin.name}</div>
    `;
    
    // Skin row
    skinRow.innerHTML = '';
    skins.forEach(skin => {
        const skinBox = document.createElement('div');
        skinBox.className = `skinBox ${skin.name === selectedSkin.name ? 'selected' : ''}`;
        
        const img = document.createElement('img');
        img.src = skin.file;
        img.style.cssText = 'width:110px;height:110px;border-radius:15px;object-fit:cover;';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = skin.name;
        
        const priceDiv = document.createElement('div');
        priceDiv.className = 'price';
        priceDiv.textContent = `${skin.unlockScore} pts`;
        
        const overlay = document.createElement('div');
        overlay.className = 'lockOverlay';
        if (!skinData[skin.name]?.unlocked) {
            overlay.textContent = '🔒';
        } else {
            overlay.style.display = 'none';
        }
        
        skinBox.append(img, nameDiv, priceDiv, overlay);
        
        skinBox.onclick = () => {
            playSound('button');
            if (skinData[skin.name]?.unlocked) {
                selectedSkin = skin;
                selectedSkinName = skin.name;
                renderSkins();
                confirmBtn.className = 'confirmBtn unlocked';
            }
        };
        
        skinRow.appendChild(skinBox);
    });
    
    confirmBtn.className = skinData[selectedSkin.name]?.unlocked ? 'confirmBtn unlocked' : 'confirmBtn locked';
}

// Store screen handlers
document.addEventListener('DOMContentLoaded', () => {
    const storeBtn = document.getElementById('storeBtn');
    const backStoreBtn = document.querySelector('.backStoreBtn');
    const confirmSkinBtn = document.getElementById('confirmSkinBtn');
    
    storeBtn.onclick = () => {
        playSound('button');
        document.getElementById('titleScreen').style.display = 'none';
        document.getElementById('storeScreen').style.display = 'flex';
        renderSkins();
    };
    
    backStoreBtn.onclick = () => {
        playSound('button');
        document.getElementById('storeScreen').style.display = 'none';
        document.getElementById('titleScreen').style.display = 'flex';
    };
    
    confirmSkinBtn.onclick = () => {
        playSound('button');
        if (confirmSkinBtn.classList.contains('unlocked')) {
            localStorage.setItem('selectedSkin', selectedSkinName);
            document.getElementById('storeScreen').style.display = 'none';
            document.getElementById('titleScreen').style.display = 'flex';
        }
    };
    
    // Unlock skins based on high score
    const highScore = parseInt(localStorage.getItem('fluppyHighScore')) || 0;
    skins.forEach(skin => {
        if (highScore >= skin.unlockScore) {
            skinData[skin.name] = {unlocked: true};
        }
    });
    localStorage.setItem('fluppySkins', JSON.stringify(skinData));
});
