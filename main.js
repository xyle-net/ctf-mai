
const map = document.getElementById('stations');
const terminal = document.getElementById('terminal');
const out = document.getElementById('term-output');
const cmd = document.getElementById('cmd');
const closeBtn = document.getElementById('closeTerm');
const keySound = document.getElementById('keySound');
const progressEl = document.getElementById('progress-count');

// Very small typewriter effect
function typeLine(text, speed=12){
  return new Promise(resolve => {
    let i = 0;
    const line = document.createElement('div');
    out.appendChild(line);
    const tick = () => {
      line.textContent = text.slice(0, i++);
      if (i <= text.length) {
        if (Math.random() < 0.5) keySound?.play().catch(()=>{});
        setTimeout(tick, speed);
        out.scrollTop = out.scrollHeight;
      } else resolve();
    };
    tick();
  });
}
function println(text=""){ const d=document.createElement('div'); d.innerHTML=text; out.appendChild(d); out.scrollTop=out.scrollHeight; }

const FLAGS = new Set();
function updateProgress(){ progressEl.textContent = FLAGS.size; }

const modules = {
  airlock: {
    title: "БОРТОВОЙ КОМПЬЮТЕР",
    intro: `Бортовой ИИ: Обнаружен запрос на открытие внешнего терминала.
Протокол подтверждения: Космический терминал закрыт, но ключ рядом!
В файле буквы, их Цезарь скрывает.
Сдвинь каждую букву на три назад —
И команда шлюз открывает!
Файл с перехваченным словом: <a class="asset" href="assets/airlock_dtmf.txt" download>airlock_dtmf.txt</a>
Введи итоговую команду (UPPER_SNAKE_CASE).`,
    check: (input)=> input.trim() === "OPEN" ? "MOONBASE{OPEN}" : null
  },
  bridge: {
    title: "РУБКА",
    intro: `ИИ: Доступ в рубку по паре логин/пароль.
К тебе попал экспорт фрагмента HTML (<a class="asset" href="assets/bridge_snippet.html" download>bridge_snippet.html</a>) и список популярных паролей (<a class="asset" href="assets/top_passwords.txt" download>top_passwords.txt</a>).
Задача: «брутфорсом» подобрать пароль к пользователю captain.
Подсказка: Капитан к рубке путь держит свой,
Но пароль скрыт за звёздной чертой.
В списке ищи, пробуй слово за словом,
Космос и год откроют пароля основы!
Сообщи найденную пару как: captain:пароль`,
    check: (input)=> input.trim() === "captain:orbit2025" ? "MOONBASE{BRIDGE_UNLOCKED}" : null
  },
  power: {
    title: "ЭНЕРГОБЛОК",
    intro: `ИИ: Критическая просадка мощности в основном реакторе! Требуется перераспределить энергию.
Для отключения второстепенных систем введите приоритетный код отключения.
Код основан на текущих показаниях энергопотребления.
Правило расчета:
Двигатели: 127 МВт
Жизнеобеспечение: 33 МВт
Навигация: 15 МВт
Связь: 7 МВт
Код отключения = (Двигатели - Жизнеобеспечение) * 10 + (Навигация - Связь)
Введи итоговый код (число)`,
    check: (input)=> input.trim() === "948" ? "948" : null
  },
  robots: {
    title: "РОБОТЫ",
    intro: `ИИ: Обнаружен запрос на корректировку орбиты спутника-разведчика «Зенит».
Для авторизации команды требуется ввести текущий азимут и угол места цели на наземный пункт приёма.
Данные зашифрованы в позывном цели!
Действия:
Позывной спутника: VOSTOK
Введи итоговую команду в формате: AZIMUTH_ELEVATION
Подсказка: На орбите спутник тайну хранит,
Три первые буквы дорогу укажут ввысь — умножь на десять, не ленись.
Три последние буквы угол к небу дадут,
Сложи их числа — и команду ты найдёшь тут.`,
    check: (input)=> input.trim() === "560_46" ? "560_46" : null
  },
  lab: {
    title: "ЛАБОРАТОРИЯ",
    intro: `ИИ: В архиве авиакомпании найден журнал полётов (<a class="asset" href="assets/flight_log.html" download>flight_log</a>).
Найди переменные или заметки, где спрятан флаг (MOONBASE{...}).`,
  check: (input)=> input.trim() === "MOONBASE{4V14T10N_R4D4R}" ? "MOONBASE{4V14T10N_R4D4R}" : null
  },
  comms: {
    title: "СВЯЗЬ",
    intro: `ИИ: Обнаружена ошибка при пробуждении экипажа!  
Чтобы открыть криокапсулу, нужно ввести код разблокировки.  
Подсказка:  
В файле журнала (<a class="asset" href="assets/cryopod_log.txt" download>cryopod_log.txt</a>) спрятана последовательность чисел.  
Это числа Фибоначчи, но одно из них — неправильное.  
Твоё действие:  
Во сне корабль меж звёзд плывёт,
Числовой узор вперёд зовёт.
Но в ряду гармонии сбой один —
Найди чужака — проснёшься из глубин.`,
    check: (input)=> input.trim() === "98" ? "98" : null
  },
  quarters: {
    title: "ЭЛЮМИНАТОР",
    intro: `ИИ: В домашнем каталоге найден артефакт .bash_history (<a class="asset" href="assets/bash_history.html" download>bash_history</a>).
Найди следы переменных/команд и сообщи флаг (MOONBASE{...}).`,
    check: (input)=> input.trim() === "MOONBASE{SWEET_DREAMS}" ? "MOONBASE{SWEET_DREAMS}" : null
  }
};

let current = null;

function openModule(id){
  current = modules[id];
  terminal.classList.remove('hidden');
  out.innerHTML = "";
  typeLine(`[${current.title}] подключение к терминалу...`).then(()=>{
    println(current.intro);
    println(`<span class="note">Доступные команды: <b>help</b>, <b>hint</b>, <b>clear</b></span>`);
  });
  cmd.value = "";
  cmd.focus();
}

function handleInput(value){
  const v = value.trim();
  if (!v) return;

  if (v === 'clear'){ out.innerHTML = ""; return; }
  if (v === 'help'){ 
    println(`Используй внешний инструментарий. Здесь просто вводи ответы/флаги.`);
    return; 
  }
  if (v === 'hint'){
    const hints = {
      airlock: "Шифр Цезаря, сдвиг на 3 назад",
      bridge: "Сначала найди пользователя 'captain' в HTML, затем перебери top_passwords.txt.",
      power: "Экран мирует красным. Срочно! (94 * 10) + (8). Умножь разницу мощностей на 10 и прибавь результат отключения навигации и связи!",
      robots: "Каждая буква — это число (A=1, B=2, C=3, ... Z=26). Азимут = (Сумма первых трёх букв) * 10 Угол места = Сумма последних трёх букв",
      lab: "BMP: проверь хвост файла. Пароль для ZIP спрятан в JPEG-комментарии (exiftool показывает 'Comment').",
      comms: "Числа Фибоначчи образуются так: каждое новое число = сумма двух предыдущих. Например: 1, 1, 2, 3, 5, 8, … Продолжи по правилу и сравни с рядом в файле — одно число там не вписывается. Это и есть код.",
      quarters: "Посмотри export SECRET=..."
    };
    println(hints[currentKey] || "Подсказка недоступна");
    return;
  }

  // Check answers
  const res = current.check(v);
  if (res){
    if(current.title==="ЛАБОРАТОРИЯ"){
      println(`<span class="success">Принято: ${current.successNote}</span>`);
      FLAGS.add("lab");
    } else {
      println(`<span class="success">Принято: ${res}</span>`);
      FLAGS.add(current.title);
    }
    updateProgress();
  } else {
    println(`<span class="fail">Неверно. Попробуй ещё.</span>`);
  }
}

let currentKey = null;
document.querySelectorAll('.module').forEach(g=>{
  g.addEventListener('click', ()=>{
    currentKey = g.id;
    openModule(currentKey);
  });
});

cmd.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter'){
    handleInput(cmd.value);
    cmd.value = "";
  }
});
closeBtn.addEventListener('click', ()=> terminal.classList.add('hidden'));

// Create a tiny keyclick sound (data URI not supported offline here), so leave empty if not found.
