export const LANGUAGE_CATALOG=[
{id:"cs",name:"Čeština",label:"Чешский",flag:"🇨🇿"},
{id:"en",name:"English",label:"Английский",flag:"🇬🇧"},
{id:"de",name:"Deutsch",label:"Немецкий",flag:"🇩🇪"},
{id:"pl",name:"Polski",label:"Польский",flag:"🇵🇱"},
{id:"uk",name:"Українська",label:"Украинский",flag:"🇺🇦"},
{id:"sk",name:"Slovenčina",label:"Словацкий",flag:"🇸🇰"},
{id:"es",name:"Español",label:"Испанский",flag:"🇪🇸"},
{id:"fr",name:"Français",label:"Французский",flag:"🇫🇷"},
{id:"it",name:"Italiano",label:"Итальянский",flag:"🇮🇹"}];
export const LEARNING_GOALS=[
{id:"everyday-life",label:"Повседневная жизнь"},
{id:"living-in-country",label:"Жизнь в стране"},
{id:"work",label:"Работа"},
{id:"travel",label:"Путешествия"},
{id:"friends",label:"Друзья и общение"},
{id:"reading",label:"Чтение"}];
export const SELF_ASSESSMENT=[
{id:"starter",label:"Я почти ничего не знаю",value:.10},
{id:"words",label:"Я понимаю отдельные слова",value:.22},
{id:"simple",label:"Я могу строить простые предложения",value:.38},
{id:"conversational",label:"Я разговариваю, но часто ошибаюсь",value:.58},
{id:"comfortable",label:"Я уже довольно свободно говорю",value:.78}];
export function getLanguageMeta(id){return LANGUAGE_CATALOG.find(x=>x.id===id)??{id,name:id.toUpperCase(),label:id.toUpperCase(),flag:"🌐"};}
