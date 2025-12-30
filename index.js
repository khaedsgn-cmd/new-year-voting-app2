// ======================= ОТЛАДКА И ЛОГИРОВАНИЕ =======================
console.log('=== ЗАГРУЗКА ПРИЛОЖЕНИЯ ===');
console.log('Время загрузки:', new Date().toISOString());
console.log('User Agent:', navigator.userAgent);

// Проверяем доступные API
console.log('localStorage доступен:', typeof localStorage !== 'undefined');
console.log('Telegram Web App доступен:', typeof window.Telegram !== 'undefined');
console.log('window.Telegram:', window.Telegram);
console.log('Telegram.WebApp:', window.Telegram?.WebApp);

// ======================= КОНСТАНТЫ И ДАННЫЕ =======================
const nominationsData = [
    {
        id: 1,
        title: "Темная лошадка года",
        nominees: ["Tunda Vitaliy", "G&N", "Nervxus", "Sviridov", "Khlopyev"]
    },
    {
        id: 2,
        title: "Событие года",
        nominees: ["Save Your Head", "BV.S94", "Новогодние Шарики от Паштета", "Thumb do", "Holiness"]
    },
    {
        id: 3,
        title: "Медиа дизайнер года",
        nominees: ["Danil Cosmi", "Mika Holy", "Domoraider", "Qwatow", "Surkov.94", "Kaydee"]
    },
    {
        id: 4,
        title: "Открытие года",
        nominees: ["Dimko", "Reck", "Khlopyev", "Sviridov", "Earth", "Afonichev"]
    },
    {
        id: 5,
        title: "Проект года",
        nominees: ["Проект 'Северное сияние'", "Кампания 'Зимний ветер'", "Инициатива 'Снежинка'", "Акция 'Новогоднее чудо'"]
    },
    {
        id: 6,
        title: "Коллаборация года",
        nominees: ["Крысы & Кошки", "Снеговики & Ёлки", "Звёзды & Луна", "Подарки & Сюрпризы"]
    },
    {
        id: 7,
        title: "Прорыв года",
        nominees: ["Новичок-гений", "Тихая гавань", "Буря эмоций", "Скачок в развитии", "Озарение"]
    }
];

const ballColors = [
    { id: 'red', name: 'красный', class: 'ball-red', emoji: '🔴' },
    { id: 'green', name: 'зеленый', class: 'ball-green', emoji: '🟢' },
    { id: 'blue', name: 'синий', class: 'ball-blue', emoji: '🔵' },
    { id: 'gold', name: 'золотой', class: 'ball-gold', emoji: '🟡' },
    { id: 'silver', name: 'серебряный', class: 'ball-silver', emoji: '⚪' },
    { id: 'purple', name: 'фиолетовый', class: 'ball-purple', emoji: '🟣' }
];

// ======================= СОСТОЯНИЕ ПРИЛОЖЕНИЯ =======================
const appState = {
    votes: {},
    userId: null,
    totalNominations: nominationsData.length,
    captchaPassed: false,
    selectedBall: null,
    correctBallColor: null,
    isInitialized: false
};

// ======================= ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =======================
let tg = null;
let nominationsContainer = null;
let voteButton = null;
let modal = null;
let successModal = null;
let captchaModal = null;
let confirmVoteButton = null;
let cancelVoteButton = null;
let cancelCaptchaButton = null;
let closeSuccessButton = null;
let progressCount = null;
let progressFill = null;
let totalNominationsEl = null;
let correctBallColorEl = null;
let captchaResult = null;
let christmasTree = null;

// ======================= УТИЛИТЫ =======================
function logError(context, error) {
    console.error(`❌ Ошибка в ${context}:`, error);
    console.error('Стек вызовов:', error.stack);
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ======================= ОСНОВНЫЕ ФУНКЦИИ =======================
function initApp() {
    try {
        console.log('🚀 Инициализация приложения...');
        
        // 1. Инициализация Telegram Web App
        initTelegram();
        
        // 2. Получение DOM элементов
        getDOMElements();
        
        // 3. Загрузка сохраненных данных
        loadVotes();
        
        // 4. Рендер интерфейса
        renderNominations();
        updateProgress();
        
        // 5. Настройка слушателей событий
        setupEventListeners();
        
        // 6. Дополнительные инициализации
        createSnowflakes();
        
        appState.isInitialized = true;
        console.log('✅ Приложение успешно инициализировано');
        
    } catch (error) {
        logError('initApp', error);
        alert('Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
    }
}

function initTelegram() {
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            tg = window.Telegram.WebApp;
            console.log('📱 Telegram Web App обнаружен');
            console.log('Версия:', tg.version);
            console.log('Платформа:', tg.platform);
            console.log('Цветовая схема:', tg.colorScheme);
            
            // Настройка Telegram Web App
            tg.expand();
            tg.enableClosingConfirmation();
            if (tg.BackButton) {
                tg.BackButton.hide();
            }
            
            // Получаем ID пользователя
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                appState.userId = tg.initDataUnsafe.user.id;
                console.log('👤 ID пользователя Telegram:', appState.userId);
            } else {
                appState.userId = generateUserId();
                console.log('👤 Сгенерирован демо ID:', appState.userId);
            }
            
            // Устанавливаем цвет фона
            if (tg.setBackgroundColor) {
                tg.setBackgroundColor('#0a2e1f');
            }
            
        } else {
            console.log('🌐 Режим браузера (без Telegram)');
            appState.userId = generateUserId();
            console.log('👤 Сгенерирован демо ID:', appState.userId);
        }
    } catch (error) {
        logError('initTelegram', error);
        appState.userId = generateUserId();
    }
}

function getDOMElements() {
    console.log('🔍 Поиск DOM элементов...');
    
    nominationsContainer = document.getElementById('nominationsContainer');
    voteButton = document.getElementById('voteButton');
    modal = document.getElementById('modal');
    successModal = document.getElementById('successModal');
    captchaModal = document.getElementById('captchaModal');
    confirmVoteButton = document.getElementById('confirmVote');
    cancelVoteButton = document.getElementById('cancelVote');
    cancelCaptchaButton = document.getElementById('cancelCaptcha');
    closeSuccessButton = document.getElementById('closeSuccess');
    progressCount = document.getElementById('progressCount');
    progressFill = document.getElementById('progressFill');
    totalNominationsEl = document.getElementById('totalNominations');
    correctBallColorEl = document.getElementById('correctBallColor');
    captchaResult = document.getElementById('captchaResult');
    christmasTree = document.getElementById('christmasTree');
    
    // Проверяем, что все элементы найдены
    const elements = {
        nominationsContainer,
        voteButton,
        modal,
        successModal,
        captchaModal,
        confirmVoteButton,
        cancelVoteButton,
        cancelCaptchaButton,
        closeSuccessButton,
        progressCount,
        progressFill,
        totalNominationsEl,
        correctBallColorEl,
        captchaResult,
        christmasTree
    };
    
    let allFound = true;
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`❌ Не найден элемент: ${name}`);
            allFound = false;
        }
    }
    
    if (!allFound) {
        throw new Error('Не все DOM элементы найдены');
    }
    
    console.log('✅ Все DOM элементы найдены');
}

function setupEventListeners() {
    console.log('🔗 Настройка обработчиков событий...');
    
    try {
        // Основная кнопка голосования
        if (voteButton) {
            voteButton.addEventListener('click', showModal);
            console.log('✅ Обработчик для voteButton добавлен');
        }
        
        // Кнопки модального окна подтверждения
        if (confirmVoteButton) {
            confirmVoteButton.addEventListener('click', showCaptcha);
        }
        
        if (cancelVoteButton) {
            cancelVoteButton.addEventListener('click', hideModal);
        }
        
        // Кнопки капчи
        if (cancelCaptchaButton) {
            cancelCaptchaButton.addEventListener('click', hideCaptcha);
        }
        
        // Кнопка успешного голосования
        if (closeSuccessButton) {
            closeSuccessButton.addEventListener('click', hideSuccessModal);
        }
        
        console.log('✅ Все обработчики событий настроены');
        
    } catch (error) {
        logError('setupEventListeners', error);
    }
}

// ======================= ФУНКЦИИ РЕНДЕРА =======================
function renderNominations() {
    try {
        console.log('🎨 Рендер номинаций...');
        
        if (!nominationsContainer) {
            console.error('❌ nominationsContainer не найден');
            return;
        }
        
        nominationsContainer.innerHTML = '';
        
        nominationsData.forEach(nomination => {
            const nominationElement = document.createElement('div');
            nominationElement.className = 'nomination';
            nominationElement.dataset.id = nomination.id;
            
            const selectedNominee = appState.votes[nomination.id];
            
            nominationElement.innerHTML = `
                <div class="nomination-title">
                    <div class="nomination-number">${nomination.id}</div>
                    <h2>${nomination.title}</h2>
                </div>
                <div class="nominees">
                    ${nomination.nominees.map(nominee => `
                        <div class="nominee ${selectedNominee === nominee ? 'selected' : ''}" data-nominee="${nominee}">
                            <div class="nominee-name">${nominee}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Добавляем обработчики для номинантов
            const nomineeElements = nominationElement.querySelectorAll('.nominee');
            nomineeElements.forEach(el => {
                el.addEventListener('click', () => selectNominee(nomination.id, el.dataset.nominee));
            });
            
            nominationsContainer.appendChild(nominationElement);
        });
        
        // Обновляем отображение общего количества
        if (totalNominationsEl) {
            totalNominationsEl.textContent = appState.totalNominations;
        }
        
        console.log('✅ Номинации отрендерены');
        
    } catch (error) {
        logError('renderNominations', error);
    }
}

function selectNominee(nominationId, nominee) {
    try {
        console.log(`📝 Выбор номинанта: ${nominee} в номинации ${nominationId}`);
        
        // Сохраняем выбор
        appState.votes[nominationId] = nominee;
        
        // Обновляем визуальное отображение
        const nominationElement = document.querySelector(`.nomination[data-id="${nominationId}"]`);
        if (nominationElement) {
            const nomineeElements = nominationElement.querySelectorAll('.nominee');
            
            // Снимаем выделение со всех
            nomineeElements.forEach(el => {
                el.classList.remove('selected');
            });
            
            // Выделяем выбранного
            const selectedElement = nominationElement.querySelector(`.nominee[data-nominee="${nominee}"]`);
            if (selectedElement) {
                selectedElement.classList.add('selected');
                
                // Анимация выбора
                selectedElement.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    selectedElement.style.transform = '';
                }, 300);
            }
        }
        
        // Сохраняем и обновляем прогресс
        saveVotes();
        updateProgress();
        checkVoteButton();
        
    } catch (error) {
        logError('selectNominee', error);
    }
}

function updateProgress() {
    try {
        const votedCount = Object.keys(appState.votes).length;
        const progressPercentage = (votedCount / appState.totalNominations) * 100;
        
        if (progressCount) {
            progressCount.textContent = votedCount;
        }
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        console.log(`📊 Прогресс: ${votedCount}/${appState.totalNominations} (${progressPercentage.toFixed(1)}%)`);
        
    } catch (error) {
        logError('updateProgress', error);
    }
}

function checkVoteButton() {
    try {
        const votedCount = Object.keys(appState.votes).length;
        const allNominationsVoted = votedCount === appState.totalNominations;
        
        if (voteButton) {
            voteButton.disabled = !allNominationsVoted;
            
            // Анимация для активной кнопки
            if (!voteButton.disabled) {
                voteButton.style.animation = 'pulse 2s infinite';
                // Создаем стили для анимации, если их еще нет
                if (!document.querySelector('#pulse-animation')) {
                    const style = document.createElement('style');
                    style.id = 'pulse-animation';
                    style.textContent = `
                        @keyframes pulse {
                            0% { box-shadow: 0 10px 25px rgba(230, 57, 70, 0.4); }
                            50% { box-shadow: 0 10px 30px rgba(230, 57, 70, 0.7); }
                            100% { box-shadow: 0 10px 25px rgba(230, 57, 70, 0.4); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            } else {
                voteButton.style.animation = '';
            }
        }
        
    } catch (error) {
        logError('checkVoteButton', error);
    }
}

// ======================= КАПЧА =======================
function initCaptcha() {
    try {
        console.log('🎯 Инициализация капчи...');
        
        // Выбираем случайный цвет
        const randomIndex = Math.floor(Math.random() * ballColors.length);
        appState.correctBallColor = ballColors[randomIndex];
        
        // Устанавливаем текст задания
        if (correctBallColorEl) {
            correctBallColorEl.textContent = appState.correctBallColor.name;
            correctBallColorEl.style.color = appState.correctBallColor.id === 'gold' ? '#e9c46a' : 
                                           appState.correctBallColor.id === 'silver' ? '#b0b0b0' : 
                                           appState.correctBallColor.id;
        }
        
        // Очищаем предыдущие шарики
        if (christmasTree) {
            const existingBalls = christmasTree.querySelectorAll('.tree-decoration');
            existingBalls.forEach(ball => ball.remove());
        }
        
        // Создаем шарики
        const ballsToShow = shuffleArray([...ballColors]);
        const ballPositions = [
            { top: '15%', left: '45%' },
            { top: '25%', left: '30%' },
            { top: '25%', left: '60%' },
            { top: '45%', left: '20%' },
            { top: '45%', left: '50%' },
            { top: '45%', left: '80%' }
        ];
        
        const selectedPositions = shuffleArray(ballPositions.slice(0, 6));
        
        ballsToShow.forEach((ballColor, index) => {
            if (index < selectedPositions.length && christmasTree) {
                const ballElement = document.createElement('div');
                ballElement.className = `tree-decoration ${ballColor.class}`;
                ballElement.dataset.color = ballColor.id;
                ballElement.dataset.name = ballColor.name;
                ballElement.title = ballColor.name;
                
                ballElement.style.position = 'absolute';
                ballElement.style.top = selectedPositions[index].top;
                ballElement.style.left = selectedPositions[index].left;
                
                ballElement.innerHTML = ballColor.emoji;
                
                ballElement.addEventListener('click', () => selectBall(ballElement, ballColor.id));
                
                christmasTree.appendChild(ballElement);
            }
        });
        
        // Сбрасываем состояние капчи
        appState.selectedBall = null;
        appState.captchaPassed = false;
        
        if (captchaResult) {
            captchaResult.style.display = 'none';
            captchaResult.className = 'captcha-result';
        }
        
        console.log('✅ Капча инициализирована');
        
    } catch (error) {
        logError('initCaptcha', error);
    }
}

function selectBall(ballElement, colorId) {
    try {
        console.log(`🎯 Выбран шарик цвета: ${colorId}`);
        
        // Сбрасываем выделение у всех шариков
        document.querySelectorAll('.tree-decoration').forEach(ball => {
            ball.classList.remove('selected');
        });
        
        // Выделяем выбранный шарик
        ballElement.classList.add('selected');
        appState.selectedBall = colorId;
        
        // Проверяем правильность выбора
        const isCorrect = colorId === appState.correctBallColor.id;
        
        // Показываем результат
        if (captchaResult) {
            captchaResult.style.display = 'block';
            captchaResult.textContent = isCorrect 
                ? `✅ Верно! Вы выбрали ${appState.correctBallColor.name} новогодний шарик.`
                : `❌ Неверно! Вы выбрали шарик другого цвета. Попробуйте еще раз.`;
            
            captchaResult.className = isCorrect ? 'captcha-result captcha-success' : 'captcha-result captcha-error';
        }
        
        appState.captchaPassed = isCorrect;
        
        // Если правильно, через 1.5 секунды отправляем голос
        if (isCorrect) {
            console.log('✅ Капча пройдена!');
            setTimeout(() => {
                hideCaptcha();
                submitVote();
            }, 1500);
        } else {
            // Если неправильно, через 3 секунды сбрасываем
            setTimeout(() => {
                ballElement.classList.remove('selected');
                appState.selectedBall = null;
                if (captchaResult) {
                    captchaResult.style.display = 'none';
                }
            }, 3000);
        }
        
    } catch (error) {
        logError('selectBall', error);
    }
}

// ======================= МОДАЛЬНЫЕ ОКНА =======================
function showModal() {
    try {
        console.log('📋 Показ модального окна подтверждения');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        logError('showModal', error);
    }
}

function hideModal() {
    try {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    } catch (error) {
        logError('hideModal', error);
    }
}

function showCaptcha() {
    try {
        console.log('🎄 Показ окна капчи');
        hideModal();
        initCaptcha();
        if (captchaModal) {
            captchaModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        logError('showCaptcha', error);
    }
}

function hideCaptcha() {
    try {
        if (captchaModal) {
            captchaModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    } catch (error) {
        logError('hideCaptcha', error);
    }
}

function showSuccessModal() {
    try {
        console.log('🎉 Показ окна успеха');
        if (successModal) {
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        logError('showSuccessModal', error);
    }
}

function hideSuccessModal() {
    try {
        if (successModal) {
            successModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Если в Telegram, закрываем приложение через 0.5 секунды
        if (tg && tg.close) {
            setTimeout(() => {
                tg.close();
            }, 500);
        }
    } catch (error) {
        logError('hideSuccessModal', error);
    }
}

// ======================= СОХРАНЕНИЕ ДАННЫХ =======================
function saveVotes() {
    try {
        localStorage.setItem('newYearVotes', JSON.stringify(appState.votes));
        console.log('💾 Голоса сохранены в localStorage');
    } catch (error) {
        logError('saveVotes', error);
    }
}

function loadVotes() {
    try {
        const savedVotes = localStorage.getItem('newYearVotes');
        if (savedVotes) {
            appState.votes = JSON.parse(savedVotes);
            console.log('📂 Загружены сохраненные голоса:', appState.votes);
        } else {
            console.log('📂 Сохраненных голосов нет');
        }
    } catch (error) {
        logError('loadVotes', error);
    }
}

// ======================= ОТПРАВКА ГОЛОСА =======================
async function submitVote() {
    try {
        console.log('📤 Отправка голоса...');
        
        // Подготовка данных
        const voteData = {
            userId: appState.userId,
            votes: appState.votes,
            timestamp: new Date().toISOString(),
            captchaPassed: appState.captchaPassed,
            deviceInfo: navigator.userAgent
        };
        
        console.log('📊 Данные для отправки:', voteData);
        
        // Показываем индикатор загрузки
        if (voteButton) {
            voteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            voteButton.disabled = true;
        }
        
        // Имитируем отправку на сервер (2 секунды)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Сохраняем как отправленные
        localStorage.setItem('newYearVotesSubmitted', JSON.stringify(voteData));
        localStorage.setItem('votesSubmitted', 'true');
        
        // Отправляем в Telegram, если есть
        if (tg && tg.sendData) {
            try {
                tg.sendData(JSON.stringify(voteData));
                console.log('✅ Данные отправлены в Telegram');
            } catch (tgError) {
                console.warn('⚠️ Не удалось отправить данные в Telegram:', tgError);
            }
        }
        
        // Показываем успех
        showSuccessModal();
        
        console.log('✅ Голос успешно отправлен');
        
    } catch (error) {
        logError('submitVote', error);
        
        // Восстанавливаем кнопку
        if (voteButton) {
            voteButton.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить голос';
            checkVoteButton();
        }
        
        alert('Произошла ошибка при отправке голоса. Пожалуйста, попробуйте еще раз.');
    }
}

// ======================= ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ =======================
function createSnowflakes() {
    try {
        console.log('❄️ Создание снежинок...');
        
        const snowflakesContainer = document.getElementById('snowflakes');
        if (!snowflakesContainer) {
            console.warn('⚠️ Контейнер для снежинок не найден');
            return;
        }
        
        const snowflakeCount = 30;
        
        // Создаем анимацию, если ее еще нет
        if (!document.querySelector('#snowfall-animation')) {
            const style = document.createElement('style');
            style.id = 'snowfall-animation';
            style.textContent = `
                @keyframes fall {
                    0% {
                        transform: translateY(-100px) rotate(0deg);
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Создаем снежинки
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            
            const size = Math.random() * 6 + 2;
            const startX = Math.random() * 100;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 10;
            const opacity = Math.random() * 0.7 + 0.3;
            
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${startX}vw`;
            snowflake.style.opacity = opacity;
            snowflake.style.animation = `fall ${duration}s linear ${delay}s infinite`;
            
            snowflakesContainer.appendChild(snowflake);
        }
        
        console.log(`✅ Создано ${snowflakeCount} снежинок`);
        
    } catch (error) {
        logError('createSnowflakes', error);
    }
}

// ======================= ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =======================
// Ждем полной загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Экспортируем функции для отладки в консоли
window.debugApp = {
    appState,
    nominationsData,
    ballColors,
    showModal,
    hideModal,
    showCaptcha,
    hideCaptcha,
    showSuccessModal,
    hideSuccessModal,
    initCaptcha,
    renderNominations,
    updateProgress,
    saveVotes,
    loadVotes,
    submitVote,
    resetVotes: () => {
        appState.votes = {};
        saveVotes();
        renderNominations();
        updateProgress();
        checkVoteButton();
        console.log('🗑️ Голоса сброшены');
    }
};

console.log('🔧 Отладочные функции доступны в window.debugApp');
console.log('=== ЗАГРУЗКА ЗАВЕРШЕНА ===');