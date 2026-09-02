const SUPPORTED=new Set(["ru","en","uk"]);
let currentLocale="ru";

const DICTIONARY={
  ru:{
    nav_today:"Сегодня",nav_practice:"Практика",nav_words:"Слова",nav_progress:"Прогресс",nav_settings:"Настройки",
    nav_label:"Основная навигация",add_language:"+ Язык",online:"Online",offline:"Offline",
    add_language_title:"Какой язык будем учить?",language:"Язык",choose_language:"Выберите язык",
    language_reason:"Для чего он вам нужен?",multiple_goals:"Можно выбрать несколько целей.",
    confidence:"Насколько уверенно вы чувствуете себя сейчас?",cancel:"Отмена",add:"Добавить язык",
    practice_title:"Что вы хотите сделать сейчас?",practice_intro:"Выберите намерение, а не внутреннюю функцию приложения. Language Teacher сам направит вас в подходящий режим.",
    talk:"Поговорить",talk_text:"Живой многоходовый диалог. Сначала отвечаете сами, потом получаете только важные исправления.",
    pronunciation:"Потренировать произношение",pronunciation_text:"Прослушать эталон, записать себя и сравнить звучание без искусственного псевдо-скоринга.",
    review:"Повторить знакомое",review_text:"Активно вспомнить выражения, которые подошли к повторению, по их слабейшему навыку.",
    real_life:"Мне нужно это сейчас",real_life_text:"Опишите реальную ситуацию и получите естественную фразу, которую можно сразу потренировать и сохранить.",
    grammar:"Разобрать грамматику",grammar_text:"Сфокусироваться на реальной повторяющейся ошибке из вашей собственной практики.",
    grammar_empty:"Короткое объяснение одной конструкции → активное применение, без учебника грамматики.",
    recommended:"РЕКОМЕНДОВАНО СЕГОДНЯ",start_today:"Начать сегодняшнее занятие",continue_today:"Продолжить сегодняшнее занятие",view_today:"Посмотреть сегодняшнее занятие",
    completed_today:"Основная практика уже завершена.",blocks:"блоков",remaining:"осталось",due:"к повторению",no_due:"Срочных повторений нет",
    tools:"ДОПОЛНИТЕЛЬНЫЕ ИНСТРУМЕНТЫ",tools_title:"Когда хочется выбрать формат вручную",custom_exercise:"Сформировать своё упражнение",
    custom_exercise_hint:"AI Teacher · конкретная тема, ситуация или конструкция",session_preparing:"Session Engine ещё подготавливает локальную сессию",
    ui_language:"Язык интерфейса",ui_language_hint:"Основная навигация, onboarding и Practice уже локализованы; остальные экраны пока используют русский fallback.",
    settings_title:"Настройки устройства",local_hint:"Профили языков и параметры сохраняются локально в IndexedDB.",
    reduce_motion:"Уменьшить анимацию",accessibility:"Настройка доступности.",
    goals:{"everyday-life":"Повседневная жизнь","living-in-country":"Жизнь в стране",work:"Работа",travel:"Путешествия",friends:"Друзья и общение",reading:"Чтение"},
    assessment:{starter:"Я почти ничего не знаю",words:"Я понимаю отдельные слова",simple:"Я могу строить простые предложения",conversational:"Я разговариваю, но часто ошибаюсь",comfortable:"Я уже довольно свободно говорю"}
  },
  en:{
    nav_today:"Today",nav_practice:"Practice",nav_words:"Library",nav_progress:"Progress",nav_settings:"Settings",
    nav_label:"Main navigation",add_language:"+ Language",online:"Online",offline:"Offline",
    add_language_title:"Which language would you like to learn?",language:"Language",choose_language:"Choose a language",
    language_reason:"What do you need it for?",multiple_goals:"You can choose several goals.",
    confidence:"How confident do you feel right now?",cancel:"Cancel",add:"Add language",
    practice_title:"What would you like to do now?",practice_intro:"Choose an intention, not an internal app feature. Language Teacher will guide you to the right mode.",
    talk:"Have a conversation",talk_text:"A real multi-turn dialogue. You answer first, then receive only useful corrections.",
    pronunciation:"Practice pronunciation",pronunciation_text:"Listen to a reference, record yourself and compare without fake pronunciation scoring.",
    review:"Review familiar language",review_text:"Actively recall expressions that are due, focusing on their weakest skill.",
    real_life:"I need this right now",real_life_text:"Describe a real situation and get a natural phrase you can practice and save immediately.",
    grammar:"Focus on grammar",grammar_text:"Work on a real recurring mistake from your own practice.",
    grammar_empty:"One short explanation → active use, without turning the app into a grammar textbook.",
    recommended:"RECOMMENDED TODAY",start_today:"Start today's session",continue_today:"Continue today's session",view_today:"View today's session",
    completed_today:"Today's main practice is already complete.",blocks:"blocks",remaining:"remaining",due:"due for review",no_due:"Nothing urgent to review",
    tools:"ADDITIONAL TOOLS",tools_title:"When you want to choose a format manually",custom_exercise:"Create a custom exercise",
    custom_exercise_hint:"AI Teacher · a specific topic, situation or structure",session_preparing:"Session Engine is still preparing the local session",
    ui_language:"Interface language",ui_language_hint:"Main navigation, onboarding and Practice are localized; remaining screens currently use a Russian fallback.",
    settings_title:"Device settings",local_hint:"Language profiles and settings are stored locally in IndexedDB.",
    reduce_motion:"Reduce motion",accessibility:"Accessibility setting.",
    goals:{"everyday-life":"Everyday life","living-in-country":"Living in the country",work:"Work",travel:"Travel",friends:"Friends and communication",reading:"Reading"},
    assessment:{starter:"I know almost nothing",words:"I understand individual words",simple:"I can build simple sentences",conversational:"I can speak, but I often make mistakes",comfortable:"I already speak quite comfortably"}
  },
  uk:{
    nav_today:"Сьогодні",nav_practice:"Практика",nav_words:"Слова",nav_progress:"Прогрес",nav_settings:"Налаштування",
    nav_label:"Основна навігація",add_language:"+ Мова",online:"Online",offline:"Offline",
    add_language_title:"Яку мову будемо вивчати?",language:"Мова",choose_language:"Виберіть мову",
    language_reason:"Для чого вона вам потрібна?",multiple_goals:"Можна вибрати кілька цілей.",
    confidence:"Наскільки впевнено ви почуваєтеся зараз?",cancel:"Скасувати",add:"Додати мову",
    practice_title:"Що ви хочете зробити зараз?",practice_intro:"Оберіть намір, а не внутрішню функцію застосунку. Language Teacher сам направить вас у відповідний режим.",
    talk:"Поговорити",talk_text:"Живий багатокроковий діалог. Спочатку відповідаєте самі, потім отримуєте лише важливі виправлення.",
    pronunciation:"Потренувати вимову",pronunciation_text:"Прослухати зразок, записати себе й порівняти звучання без штучного псевдо-оцінювання.",
    review:"Повторити знайоме",review_text:"Активно пригадати вирази, для яких настав час повторення, за їхньою найслабшою навичкою.",
    real_life:"Мені це потрібно зараз",real_life_text:"Опишіть реальну ситуацію й отримайте природну фразу, яку можна відразу потренувати та зберегти.",
    grammar:"Розібрати граматику",grammar_text:"Зосередитися на реальній повторюваній помилці з вашої власної практики.",
    grammar_empty:"Коротке пояснення однієї конструкції → активне застосування, без підручника граматики.",
    recommended:"РЕКОМЕНДОВАНО СЬОГОДНІ",start_today:"Почати сьогоднішнє заняття",continue_today:"Продовжити сьогоднішнє заняття",view_today:"Переглянути сьогоднішнє заняття",
    completed_today:"Основну практику на сьогодні вже завершено.",blocks:"блоків",remaining:"залишилося",due:"до повторення",no_due:"Термінових повторень немає",
    tools:"ДОДАТКОВІ ІНСТРУМЕНТИ",tools_title:"Коли хочеться вибрати формат вручну",custom_exercise:"Створити власну вправу",
    custom_exercise_hint:"AI Teacher · конкретна тема, ситуація або конструкція",session_preparing:"Session Engine ще готує локальне заняття",
    ui_language:"Мова інтерфейсу",ui_language_hint:"Основна навігація, onboarding і Practice вже локалізовані; решта екранів поки використовує російський fallback.",
    settings_title:"Налаштування пристрою",local_hint:"Мовні профілі й налаштування зберігаються локально в IndexedDB.",
    reduce_motion:"Зменшити анімацію",accessibility:"Налаштування доступності.",
    goals:{"everyday-life":"Повсякденне життя","living-in-country":"Життя в країні",work:"Робота",travel:"Подорожі",friends:"Друзі та спілкування",reading:"Читання"},
    assessment:{starter:"Я майже нічого не знаю",words:"Я розумію окремі слова",simple:"Я можу будувати прості речення",conversational:"Я розмовляю, але часто помиляюся",comfortable:"Я вже досить вільно розмовляю"}
  }
};

export function setLocale(locale){
  currentLocale=SUPPORTED.has(locale)?locale:"ru";
  if(typeof document!=="undefined")document.documentElement.lang=currentLocale;
  return currentLocale;
}
export function getLocale(){return currentLocale;}
export function t(key,params={}){
  let value=DICTIONARY[currentLocale]?.[key]??DICTIONARY.ru[key]??key;
  if(typeof value!=="string")return value;
  return value.replace(/\{(\w+)\}/g,(_,name)=>String(params[name]??`{${name}}`));
}
export function translateGoal(id){return DICTIONARY[currentLocale]?.goals?.[id]??DICTIONARY.ru.goals[id]??id;}
export function translateAssessment(id){return DICTIONARY[currentLocale]?.assessment?.[id]??DICTIONARY.ru.assessment[id]??id;}
