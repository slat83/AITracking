export const APP_LOCALE_COOKIE = "flowvory-locale";

export const APP_LOCALES = ["en", "ru"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_APP_LOCALE: AppLocale = "en";

const INTL_LOCALE_BY_APP_LOCALE: Record<AppLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
};

const HTML_LANG_BY_APP_LOCALE: Record<AppLocale, string> = {
  en: "en",
  ru: "ru",
};

const RUSSIAN_MONTHS: Record<string, string> = {
  Jan: "января",
  January: "января",
  Feb: "февраля",
  February: "февраля",
  Mar: "марта",
  March: "марта",
  Apr: "апреля",
  April: "апреля",
  May: "мая",
  Jun: "июня",
  June: "июня",
  Jul: "июля",
  July: "июля",
  Aug: "августа",
  August: "августа",
  Sep: "сентября",
  Sept: "сентября",
  September: "сентября",
  Oct: "октября",
  October: "октября",
  Nov: "ноября",
  November: "ноября",
  Dec: "декабря",
  December: "декабря",
};

const RUSSIAN_EXACT_TRANSLATIONS: Record<string, string> = {
  "Access": "Доступ",
  "Access invite-only workspace": "Открыть доступ к закрытому рабочему пространству",
  "Action plan": "План действий",
  "Action rail is empty.": "Панель действий пока пуста.",
  "Activate workspace access": "Активировать доступ к рабочему пространству",
  "Active playbooks": "Активные плейбуки",
  "Active playbooks by scenario type": "Активные плейбуки по типам сценариев",
  "Active queue": "Активная очередь",
  "Active queue blockers grouped by their strongest current cause.": "Активные блокеры в очереди, сгруппированные по основной причине.",
  "Active task": "Активная задача",
  "Active triage": "Активный триаж",
  "Add at least one Reddit thread URL.": "Добавьте хотя бы один URL треда Reddit.",
  "Add at least one keyword.": "Добавьте хотя бы одно ключевое слово.",
  "Add keywords": "Добавить ключевые слова",
  "Add one or more Reddit thread URLs to keep them visible in the operator queue.": "Добавьте один или несколько URL тредов Reddit, чтобы они оставались видимыми в операторской очереди.",
  "Add one or more discovery phrases. Separate entries with commas or new lines.": "Добавьте одну или несколько поисковых фраз. Разделяйте записи запятыми или новыми строками.",
  "Add opportunity": "Добавить возможность",
  "Add post": "Добавить публикацию",
  "Add threads": "Добавить треды",
  "All accounts": "Все аккаунты",
  "All owners": "Все владельцы",
  "All scenario types": "Все типы сценариев",
  "All urgency": "Любой приоритет",
  "Answered posts": "Отвеченные публикации",
  "Approval-gated templates": "Шаблоны с обязательным согласованием",
  "Approvals": "Согласования",
  "Approver not assigned": "Согласующий не назначен",
  "Archive": "Архивировать",
  "Archived": "В архиве",
  "Archived or rejected": "В архиве или отклонено",
  "Artifact updated": "Артефакт обновлен",
  "Assets in library": "Материалы в библиотеке",
  "At risk": "Под риском",
  "Author": "Автор",
  "Available launch packs": "Доступные пакеты запуска",
  "Average approval latency": "Средняя задержка согласования",
  "Average time to next action": "Среднее время до следующего действия",
  "Average time to triage": "Среднее время до триажа",
  "Awaiting invite": "Ожидают приглашение",
  "Back to workspace": "Назад в рабочее пространство",
  "Best fit": "Лучше всего подходит",
  "Blocked": "Заблокировано",
  "Blocked in period": "Заблокировано за период",
  "Blocker causes in period": "Причины блокировок за период",
  "Blockers": "Блокеры",
  "Brand name": "Название бренда",
  "Breadcrumb": "Хлебные крошки",
  "Built at:": "Собрано:",
  "Business impact": "Влияние на бизнес",
  "Cancel": "Отменить",
  "Capture new intake, qualify it against the active seeded scenario types, and hand it into the scenario workspace once the brief is complete enough for a downstream operator to execute.": "Захватывайте новый входящий запрос, сверяйте его с активными заготовленными типами сценариев и передавайте в рабочее пространство сценариев, когда бриф уже достаточно полон для следующего оператора.",
  "Capture opportunity": "Зафиксировать возможность",
  "Capture pilot": "Зафиксировать пилот",
  "Capture pilot request": "Зафиксировать запрос на пилот",
  "Captured": "Зафиксировано",
  "Child artifacts": "Дочерние артефакты",
  "Choose a scenario from the queue to load the detail workspace and action rail.": "Выберите сценарий из очереди, чтобы открыть детальное рабочее пространство и панель действий.",
  "Choose a scenario to see the recommended next action and proof requirements.": "Выберите сценарий, чтобы увидеть рекомендуемое следующее действие и требования к доказательствам.",
  "Clarification request": "Запрос на уточнение",
  "Commercial controls for this pilot": "Коммерческие настройки для этого пилота",
  "Commercial seam": "Коммерческий стык",
  "Commercial status": "Коммерческий статус",
  "Commit SHA": "SHA коммита",
  "Community dashboard": "Дашборд сообщества",
  "Community monitoring dashboard": "Дашборд мониторинга сообщества",
  "Complete the onboarding inputs so the audit can begin.": "Заполните входные данные онбординга, чтобы аудит мог начаться.",
  "Context timeline": "Таймлайн контекста",
  "Create invoice draft": "Создать черновик счета",
  "Create password": "Создать пароль",
  "Current blocker snapshot": "Текущий снимок блокировок",
  "Current founder ask": "Текущий запрос от основателя",
  "Current founder request": "Текущий запрос основателя",
  "Current stage": "Текущий этап",
  "Current stage note": "Заметка по текущему этапу",
  "Default": "По умолчанию",
  "Default playbooks": "Базовые плейбуки",
  "Delete": "Удалить",
  "Delivered": "Доставлено",
  "Delivery note": "Примечание по поставке",
  "Delivery notes": "Примечания по поставке",
  "Detached intake and triage support queue": "Отдельная вспомогательная очередь intake и triage",
  "Done": "Готово",
  "Draft handoff updated": "Передача черновика обновлена",
  "EDITOR": "РЕДАКТОР",
  "Each asset shows readiness, usage scope, and where it is currently supporting live scenario work.": "Каждый материал показывает готовность, область использования и то, где он сейчас поддерживает активную работу по сценариям.",
  "Each pack can seed scenario definitions, recommended actions, and proof expectations without narrowing the shell to one business forever.": "Каждый пакет может задавать определения сценариев, рекомендуемые действия и ожидания по доказательствам, не сужая оболочку навсегда до одного бизнеса.",
  "Email": "Email",
  "Enter workspace": "Войти в рабочее пространство",
  "Escalate": "Эскалировать",
  "Escalate or reassign": "Эскалировать или переназначить",
  "Escalation owner": "Владелец эскалации",
  "Escalation target": "Адресат эскалации",
  "Evidence": "Доказательства",
  "Evidence assets": "Материалы-доказательства",
  "Evidence linked": "Доказательство привязано",
  "Evidence restrictions stay visible here so public or community work does not look universally safe just because a template exists.": "Ограничения по доказательствам остаются видимыми здесь, чтобы публичная или community-работа не выглядела автоматически безопасной только из-за наличия шаблона.",
  "Execution targets": "Цели исполнения",
  "FAQ": "FAQ",
  "Failed to add keywords.": "Не удалось добавить ключевые слова.",
  "Failed to add tracked post.": "Не удалось добавить отслеживаемую публикацию.",
  "Failed to add tracked threads.": "Не удалось добавить отслеживаемые треды.",
  "Failed to load dashboard data.": "Не удалось загрузить данные дашборда.",
  "Failed to move post to answered.": "Не удалось перенести публикацию в отвеченные.",
  "Failed to remove keyword.": "Не удалось удалить ключевое слово.",
  "Failed to remove tracked thread.": "Не удалось удалить отслеживаемый тред.",
  "Find where your brand is missing from AI-driven buying journeys.": "Найдите, где ваш бренд отсутствует в покупательских сценариях с участием ИИ.",
  "Findings": "Находки",
  "Findings summary": "Сводка находок",
  "Findings will appear here once Flowvory publishes the audit output.": "Находки появятся здесь, как только Flowvory опубликует результаты аудита.",
  "Fixed-scope audit": "Аудит с фиксированным объемом",
  "Flowvory needs an update from you before the audit can continue.": "Flowvory нужен ваш апдейт, чтобы аудит мог продолжиться.",
  "Flowvory runs a founder-led AI Visibility Audit for lean eCommerce brands and delivers a prioritized 30-day action plan covering discovery gaps, trust weaknesses, and the fixes that matter first.": "Flowvory проводит founder-led AI Visibility Audit для компактных eCommerce-брендов и выдает приоритизированный 30-дневный план действий по пробелам в обнаружении, слабым местам доверия и тем исправлениям, которые важны в первую очередь.",
  "Flowvory sells one bounded diagnostic first instead of a broad platform promise.": "Flowvory сначала продает один ограниченный диагностический продукт, а не широкое обещание платформы.",
  "Founder workspace": "Рабочее пространство основателя",
  "Founder workspace navigation": "Навигация рабочего пространства основателя",
  "Founder-led AI Visibility Audit": "Founder-led аудит AI Visibility",
  "Founder-led AI Visibility Audit for eCommerce": "Founder-led AI Visibility Audit для eCommerce",
  "Founder-led brands": "Бренды под управлением основателя",
  "Freshness": "Свежесть",
  "Governed templates": "Шаблоны под управлением правил",
  "HIGH": "ВЫСОКИЙ",
  "Hide": "Скрыть",
  "Hide password": "Скрыть пароль",
  "High": "Высокий",
  "Inputs": "Входные данные",
  "Inputs completed": "Входные данные заполнены",
  "Invalid email or password.": "Неверный email или пароль.",
  "Invite accepted": "Приглашение принято",
  "Invite-only workspace": "Рабочее пространство по приглашению",
  "Invite-only workspace access": "Доступ к рабочему пространству по приглашению",
  "Issued": "Выставлено",
  "Keywords": "Ключевые слова",
  "LOW": "НИЗКИЙ",
  "Last action taken": "Последнее выполненное действие",
  "Last changed": "Последнее изменение",
  "Last meaningful outcome": "Последний значимый результат",
  "Latest invite": "Последнее приглашение",
  "Launch packs": "Пакеты запуска",
  "Launch packs and seeded scenario templates": "Пакеты запуска и подготовленные шаблоны сценариев",
  "Launch-specific material stays here as seeded templates, not in the global CRM navigation or the permanent product taxonomy.": "Материалы для конкретных запусков остаются здесь как подготовленные шаблоны, а не в глобальной навигации CRM или постоянной продуктовой таксономии.",
  "Language": "Язык",
  "Language switcher": "Переключатель языка",
  "Linked": "Связано",
  "Linked scenario": "Связанный сценарий",
  "Live runtime metadata stays visible here so operators can verify what production release is actually running without leaving the app shell.": "Живые runtime-метаданные остаются видимыми здесь, чтобы операторы могли проверить, какой production-релиз реально запущен, не покидая оболочку приложения.",
  "Low": "Низкий",
  "MEDIUM": "СРЕДНИЙ",
  "Manual invoice": "Ручной счет",
  "Manual invoices": "Ручные счета",
  "Manual pilot policy": "Политика ручного ведения пилотов",
  "Mark answered": "Отметить как отвеченное",
  "Mark audit in progress": "Отметить аудит как выполняющийся",
  "Mark delivered": "Отметить как доставленное",
  "Mark delivery ready": "Отметить как готовое к передаче",
  "Mark onboarding": "Отметить онбординг",
  "Mark paid": "Отметить как оплаченное",
  "Mark ready": "Отметить как готовое",
  "Mark ready for draft": "Отметить как готовое к черновику",
  "Mark sent": "Отметить как отправленное",
  "Mark waiting on founder": "Отметить как ожидающее основателя",
  "Medium": "Средний",
  "Method": "Метод",
  "Move to follow-up": "Перенести в follow-up",
  "Move to triage": "Перенести в triage",
  "NONE": "НЕТ",
  "NOT_REQUIRED": "НЕ ТРЕБУЕТСЯ",
  "Needs proof work": "Нужна работа по доказательствам",
  "New intake": "Новый intake",
  "New owner": "Новый владелец",
  "Next action created": "Следующее действие создано",
  "Next best action": "Лучшее следующее действие",
  "Next milestone": "Следующая веха",
  "No": "Нет",
  "No action required right now.": "Сейчас от вас ничего не требуется.",
  "No active blocker is stopping progress.": "Сейчас нет активного блокера, который останавливает прогресс.",
  "No active blockers in the queue.": "В очереди нет активных блокеров.",
  "No active escalation has been recorded yet.": "Активная эскалация пока не зафиксирована.",
  "No active prerequisites": "Нет активных предусловий",
  "No answered posts yet.": "Пока нет отвеченных публикаций.",
  "No approval request is active": "Активного запроса на согласование нет",
  "No blockers landed in this period.": "За этот период блокировок не зафиксировано.",
  "No child artifacts or inherited draft handoffs are attached yet.": "Дочерние артефакты или унаследованные передачи черновиков пока не привязаны.",
  "No default playbook linked.": "Базовый плейбук пока не привязан.",
  "No description is attached yet.": "Описание пока не добавлено.",
  "No eligible owners are available right now. Ask an admin to update scenario routing.": "Сейчас нет доступных подходящих владельцев. Попросите администратора обновить маршрутизацию сценариев.",
  "No evidence assets are linked yet.": "Материалы-доказательства пока не привязаны.",
  "No explicit approval prerequisite": "Явное предварительное согласование не требуется",
  "No invoice has been attached yet.": "Счет пока не прикреплен.",
  "No keywords tracked yet.": "Ключевые слова пока не отслеживаются.",
  "No next action configured yet.": "Следующее действие пока не настроено.",
  "No open founder request.": "Нет открытого запроса от основателя.",
  "No open invoice": "Нет открытого счета",
  "No open task": "Нет открытой задачи",
  "No opportunities in this state.": "В этом статусе нет возможностей.",
  "No outcome has been recorded yet.": "Результат пока не зафиксирован.",
  "No outcomes landed in this period.": "За этот период результатов не зафиксировано.",
  "No owner role modeled": "Роль владельца не смоделирована",
  "No ownership or escalation audit note is attached yet.": "Заметка об аудите владения или эскалации пока не добавлена.",
  "No pilot workspace is linked to this account": "С этим аккаунтом не связано рабочее пространство пилота",
  "No pilots in this state.": "В этом статусе нет пилотов.",
  "No playbook linked": "Плейбук не привязан",
  "No posts waiting for an answer.": "Нет публикаций, ожидающих ответа.",
  "No prerequisites are defined for this playbook yet.": "Для этого плейбука предусловия пока не определены.",
  "No proof guidance attached yet.": "Подсказка по доказательствам пока не добавлена.",
  "No recommended action recorded.": "Рекомендуемое действие пока не зафиксировано.",
  "No restricted channels are configured yet.": "Ограниченные каналы пока не настроены.",
  "No reusable hypothesis is attached yet.": "Переиспользуемая гипотеза пока не добавлена.",
  "No satisfying proof is linked yet.": "Подходящее доказательство пока не привязано.",
  "No scenario selected": "Сценарий не выбран",
  "No scenario-level blocker recorded": "Блокер на уровне сценария не зафиксирован",
  "No scenarios in this view.": "В этом представлении нет сценариев.",
  "No starting action configured yet.": "Стартовое действие пока не настроено.",
  "No subreddit": "Без сабреддита",
  "No tasks in this lane.": "В этой колонке нет задач.",
  "No template description is attached yet.": "Описание шаблона пока не добавлено.",
  "No threads tracked yet.": "Треды пока не отслеживаются.",
  "No urgency summary is attached yet.": "Сводка по срочности пока не добавлена.",
  "No usage guidance attached yet.": "Подсказка по использованию пока не добавлена.",
  "None": "Нет",
  "Not answered": "Нет ответа",
  "Not modeled": "Не смоделировано",
  "Not provisioned": "Не подготовлено",
  "Not recorded": "Не зафиксировано",
  "Not sent": "Не отправлено",
  "Not set": "Не задано",
  "Not verified": "Не подтверждено",
  "Notes": "Заметки",
  "Now": "Сейчас",
  "Observed result": "Наблюдаемый результат",
  "Observing": "Наблюдение",
  "Offer": "Предложение",
  "On track": "По плану",
  "Onboarding inputs": "Входные данные онбординга",
  "One coherent story across the launch surfaces.": "Одна цельная история на всех поверхностях запуска.",
  "One per line or comma-separated": "По одному в строке или через запятую",
  "Open": "Открыть",
  "Open intake record": "Открыть запись intake",
  "Open intake support queue": "Открыть вспомогательную очередь intake",
  "Open tasks": "Открытые задачи",
  "Open workspace": "Открыть рабочее пространство",
  "Originating intake": "Исходный intake",
  "Outcome": "Результат",
  "Outcome capture rate": "Доля сценариев с зафиксированным результатом",
  "Outcome mix": "Состав результатов",
  "Outcome not recorded yet.": "Результат пока не зафиксирован.",
  "Outcome recorded": "Результат зафиксирован",
  "Outcomes recorded": "Результаты зафиксированы",
  "Overview": "Обзор",
  "Owner": "Владелец",
  "Owner not assigned": "Владелец не назначен",
  "PARTIAL": "ЧАСТИЧНО",
  "PENDING": "ОЖИДАЕТСЯ",
  "Password": "Пароль",
  "Pilot operations": "Операции пилотов",
  "Pilot provisioning stays available for internal operations, but it sits behind the scenario workspace rather than competing with it as a primary shell destination.": "Подготовка пилотов остается доступной для внутренних операций, но находится за рабочим пространством сценариев и не конкурирует с ним как основной точкой входа оболочки.",
  "Pilots": "Пилоты",
  "Plain answers to the real objections.": "Прямые ответы на реальные возражения.",
  "Playbooks": "Плейбуки",
  "Playbooks define the recommended action, proof expectations, and operator ownership rules that keep the CRM explainable instead of opaque.": "Плейбуки задают рекомендуемое действие, ожидания по доказательствам и правила владения для операторов, чтобы CRM оставалась понятной, а не непрозрачной.",
  "Post URL": "URL публикации",
  "Posts to answer": "Публикации, ожидающие ответа",
  "Prerequisite reviewed": "Предусловие проверено",
  "Partial": "Частично",
  "Primary": "Основное",
  "Primary workspace navigation": "Основная навигация рабочего пространства",
  "Priority": "Приоритет",
  "Priority scenario": "Приоритетный сценарий",
  "Priority surfaces": "Приоритетные поверхности",
  "Proof library": "Библиотека доказательств",
  "Proof satisfied": "Доказательство закрыто",
  "Provision workspace": "Подготовить рабочее пространство",
  "Provisioning and manual invoicing": "Подготовка и ручное выставление счетов",
  "Public path": "Публичный путь",
  "Queue": "Очередь",
  "READY": "ГОТОВО",
  "REJECTED": "ОТКЛОНЕНО",
  "RESOLVED": "РЕШЕНО",
  "RESTRICTED": "ОГРАНИЧЕНО",
  "Raised time not recorded": "Время создания не зафиксировано",
  "Ready for draft": "Готово к черновику",
  "Ready": "Готово",
  "Ready to use": "Готово к использованию",
  "Reason for escalation": "Причина эскалации",
  "Reason for reassignment": "Причина переназначения",
  "Reassign owner": "Переназначить владельца",
  "Recommended action is derived from the linked scenario and current proof state.": "Рекомендуемое действие выводится из связанного сценария и текущего состояния доказательств.",
  "Recommended actions stay attached to reusable scenario types rather than hard-coded launch-specific screens.": "Рекомендуемые действия остаются привязанными к переиспользуемым типам сценариев, а не жестко прошитым экранам под отдельные запуски.",
  "Reject / park": "Отклонить / отложить",
  "Related pages": "Связанные страницы",
  "Release ID:": "ID релиза:",
  "Release identity": "Идентичность релиза",
  "Remaining risk lives in proof completeness, approvals, and task execution timing.": "Оставшийся риск связан с полнотой доказательств, согласованиями и сроками выполнения задач.",
  "Removing a post from the active queue marks it answered and keeps it visible below.": "Удаление публикации из активной очереди помечает ее как отвеченную и оставляет видимой ниже.",
  "Removing...": "Удаление...",
  "Reporting": "Отчетность",
  "Request clarification": "Запросить уточнение",
  "Request failed.": "Запрос не выполнен.",
  "Required": "Обязательно",
  "Required action": "Обязательное действие",
  "Required before execution": "Требуется до исполнения",
  "Required proof": "Требуемое доказательство",
  "Reset": "Сбросить",
  "Resolved outcome rate": "Доля результатов со статусом resolved",
  "Restricted": "Ограничено",
  "Restricted-channel governance": "Управление ограниченными каналами",
  "Return to workspace": "Вернуться в рабочее пространство",
  "Reusable across scenario types": "Переиспользуется между типами сценариев",
  "Reusable proof assets stay outside individual tasks so operators can see what is safe to reuse, what is restricted, and which scenarios still depend on missing proof.": "Переиспользуемые материалы-доказательства остаются вне отдельных задач, чтобы операторы видели, что можно использовать повторно, что ограничено и какие сценарии все еще зависят от недостающих доказательств.",
  "Review notes": "Заметки по проверке",
  "Review scenario context and choose the next operator action.": "Проверьте контекст сценария и выберите следующее действие оператора.",
  "Review signal intake": "Проверить входящий сигнал",
  "Review the scenario and set the next operator action.": "Проверьте сценарий и задайте следующее действие оператора.",
  "Review the scenario context.": "Проверьте контекст сценария.",
  "Reviewed": "Проверено",
  "Role": "Роль",
  "Roles and access": "Роли и доступ",
  "Runtime environment": "Runtime-окружение",
  "SATISFIED": "ВЫПОЛНЕНО",
  "Safety review pending": "Ожидает проверки безопасности",
  "Sample audit": "Пример аудита",
  "Save": "Сохранить",
  "Save details": "Сохранить детали",
  "Save inputs": "Сохранить входные данные",
  "Saving...": "Сохранение...",
  "Scenario captured": "Сценарий зафиксирован",
  "Scenario context": "Контекст сценария",
  "Scenario escalated": "Сценарий эскалирован",
  "Scenario families": "Семейства сценариев",
  "Scenario performance reporting": "Отчетность по эффективности сценариев",
  "Scenario reassigned": "Сценарий переназначен",
  "Scenario rules and next actions": "Правила сценариев и следующие действия",
  "Scenario type": "Тип сценария",
  "Scenario types": "Типы сценариев",
  "Scenario updated": "Сценарий обновлен",
  "Scenario workspace": "Рабочее пространство сценариев",
  "Scenarios captured": "Сценарии зафиксированы",
  "Secondary operator view": "Вторичное операторское представление",
  "Secondary workspace navigation": "Вторичная навигация рабочего пространства",
  "See a sample audit": "Посмотреть пример аудита",
  "Seeded templates": "Подготовленные шаблоны",
  "Select a scenario to load proof, approvals, blockers, and ownership context.": "Выберите сценарий, чтобы загрузить доказательства, согласования, блокеры и контекст владения.",
  "Select a scenario to load the latest meaningful change.": "Выберите сценарий, чтобы загрузить последнее значимое изменение.",
  "Select a target": "Выберите цель",
  "Select an owner": "Выберите владельца",
  "Selected view": "Выбранное представление",
  "Send or resend invite": "Отправить или переотправить приглашение",
  "Settings": "Настройки",
  "Shift to another saved view or capture new intake from the support queue.": "Переключитесь на другое сохраненное представление или зафиксируйте новый intake из вспомогательной очереди.",
  "Show": "Показать",
  "Show password": "Показать пароль",
  "Sign in": "Войти",
  "Sign in to Flowvory": "Войти в Flowvory",
  "Signing in...": "Вход...",
  "Sort": "Сортировка",
  "Source": "Источник",
  "Starting action:": "Стартовое действие:",
  "Summary": "Сводка",
  "System": "Система",
  "Target audience": "Целевая аудитория",
  "Taxonomy, permissions, and execution targets": "Таксономия, права доступа и цели исполнения",
  "Template governance baseline": "Базовая модель управления шаблонами",
  "Templates": "Шаблоны",
  "The current buyer is a lean eCommerce team that needs clarity before scaling AI visibility work.": "Текущий покупатель - компактная eCommerce-команда, которой нужна ясность до масштабирования работы по AI visibility.",
  "The primary shell lives in the scenario workspace. Use this page when intake needs cleanup, triage, or a linked source record from the active scenario.": "Основная оболочка живет в рабочем пространстве сценариев. Используйте эту страницу, когда intake требует очистки, triage или связанной исходной записи из активного сценария.",
  "The queue keeps urgency, proof, and approval risk visible before detail view.": "Очередь показывает срочность, доказательства и риск согласования до открытия детальной карточки.",
  "The shell still runs on coarse roles. This view makes the current coverage explicit and shows the permission split the product should evolve toward.": "Оболочка все еще работает на грубых ролях. Это представление явно показывает текущее покрытие и то разделение прав, к которому продукт должен двигаться.",
  "These pages explain the founder-led pilot clearly, but they do not imply a public self-serve product or guaranteed outcomes.": "Эти страницы ясно объясняют founder-led пилот, но не подразумевают публичный self-serve продукт или гарантированные результаты.",
  "This area exposes the operating configuration behind the shell so product decisions about roles, channels, and taxonomy can be reviewed without hiding them in code.": "Эта область показывает рабочую конфигурацию за оболочкой, чтобы продуктовые решения о ролях, каналах и таксономии можно было проверять без сокрытия их в коде.",
  "This intake is currently being reviewed from the scenario workspace.": "Этот intake сейчас рассматривается из рабочего пространства сценариев.",
  "This invite is no longer active. Ask Flowvory to resend it.": "Это приглашение больше не активно. Попросите Flowvory отправить его заново.",
  "This is the internal intake surface for the first founder-led pilot cohort.": "Это внутренняя поверхность intake для первой когорты founder-led пилотов.",
  "This month": "Этот месяц",
  "This public surface is intentionally narrow. It explains the offer, the audit method, the sample deliverable, and the invite-only access model without pretending the current product is a self-serve SaaS.": "Эта публичная поверхность намеренно узкая. Она объясняет предложение, метод аудита, пример результата и модель доступа по приглашениям, не делая вид, что текущий продукт - это self-serve SaaS.",
  "This scenario is closed, so ownership and escalation are view-only.": "Этот сценарий закрыт, поэтому владение и эскалация доступны только для просмотра.",
  "This scenario no longer has a linked intake record.": "У этого сценария больше нет связанной записи intake.",
  "This sign-in is active, but it is not attached to a founder workspace yet. Ask Flowvory to resend your invite or confirm that the correct email address was provisioned.": "Этот вход активен, но пока не привязан к рабочему пространству основателя. Попросите Flowvory переотправить приглашение или подтвердить, что был подготовлен правильный email.",
  "This view supports channel monitoring, but it no longer anchors the product shell. The scenario workspace remains the primary operating surface.": "Это представление поддерживает мониторинг каналов, но больше не является центром оболочки продукта. Рабочее пространство сценариев остается основной операционной поверхностью.",
  "This week": "Эта неделя",
  "This workspace is provisioned for accepted pilot customers and operators. If you already have access, continue below. If Flowvory emailed you an invite, activate that link first to create your workspace password.": "Это рабочее пространство подготовлено для принятых пилотных клиентов и операторов. Если у вас уже есть доступ, продолжайте ниже. Если Flowvory отправил вам приглашение по email, сначала активируйте эту ссылку, чтобы создать пароль для рабочего пространства.",
  "This workspace tracks your Flowvory pilot status, required inputs, and delivered outputs.": "Это рабочее пространство отслеживает статус вашего пилота Flowvory, обязательные входные данные и выданные результаты.",
  "Thread URLs": "URL тредов",
  "Tracked keywords": "Отслеживаемые ключевые слова",
  "Tracked Reddit threads": "Отслеживаемые треды Reddit",
  "Tracked threads": "Отслеживаемые треды",
  "Track queue progression, next-action speed, approval latency, outcome capture, and the blocker causes slowing scenario execution down.": "Отслеживайте движение очереди, скорость перехода к следующему действию, задержку согласований, фиксацию результатов и причины блокировок, замедляющие исполнение сценариев.",
  "Triaged": "Прошли triage",
  "Trust": "Доверие",
  "Unassigned": "Не назначен",
  "Unassigned owner": "Владелец не назначен",
  "Unavailable": "Недоступно",
  "Universal": "Универсально",
  "Unknown author": "Неизвестный автор",
  "Unspecified signal source": "Источник сигнала не указан",
  "Update escalation": "Обновить эскалацию",
  "Updated": "Обновлено",
  "Urgency": "Срочность",
  "Usage guidance not written yet.": "Подсказка по использованию пока не написана.",
  "Use the queue as the default shell surface, then move into evidence, playbooks, templates, reporting, or settings only when the active scenario requires it.": "Используйте очередь как поверхность оболочки по умолчанию, а затем переходите в доказательства, плейбуки, шаблоны, отчетность или настройки только когда этого требует активный сценарий.",
  "Users": "Пользователи",
  "VIEWER": "ПРОСМОТР",
  "Verified": "Проверено",
  "Version": "Версия",
  "View latest audit note": "Открыть последнюю заметку по аудиту",
  "WAIVED": "СНЯТО",
  "Waiting": "Ожидание",
  "Waiting on founder": "Ожидание основателя",
  "What Flowvory is doing now": "Что Flowvory делает сейчас",
  "What Flowvory needs from you": "Что Flowvory нужно от вас",
  "What changed": "Что изменилось",
  "What matters now": "Что важно сейчас",
  "What should happen next": "Что должно произойти дальше",
  "Why this matters now": "Почему это важно сейчас",
  "Workspace": "Рабочее пространство",
  "Workspace access": "Доступ к рабочему пространству",
  "Workspace access is unavailable.": "Доступ к рабочему пространству недоступен.",
  "Workspace entitlement": "Право доступа к рабочему пространству",
  "Workspace pending": "Рабочее пространство ожидает",
  "Workspace queue and scenario control surface": "Очередь рабочего пространства и поверхность управления сценариями",
  "Workspace ready": "Рабочее пространство готово",
  "Workspace status": "Статус рабочего пространства",
  "Workspace support flow": "Вспомогательный поток рабочего пространства",
  "Workspace-wide asset": "Общий материал рабочего пространства",
  "Workspace-wide target": "Общая цель рабочего пространства",
  "Yes or undecided": "Да или не определено",
  "You can view ownership history, but only authorized leads can reassign or escalate this scenario.": "Вы можете просматривать историю владения, но только уполномоченные лиды могут переназначать или эскалировать этот сценарий.",
  "Your action plan will be published here when the audit is delivered.": "Ваш план действий будет опубликован здесь, когда аудит будет передан.",
  "Your name": "Ваше имя",
  "Your workspace password": "Пароль рабочего пространства",
  "action-plan": "план действий",
  "blocked": "заблокировано",
  "by": "от",
  "danger": "критично",
  "done": "выполнена",
  "draft": "черновик",
  "in this queue.": "в этой очереди.",
  "in this state.": "в этом статусе.",
  "in this view.": "в этом представлении.",
  "not started": "не начато",
  "outstanding": "ожидает",
  "primary proof": "основное доказательство",
  "ready": "готово",
  "secondary": "вторичное",
  "supporting proof": "поддерживающее доказательство",
  "the intake queue": "очереди intake",
  "todo": "к выполнению",
  "warning": "внимание",
};

const RUSSIAN_PREFIX_TRANSLATIONS: Array<[source: string, target: string]> = [
  ["Account: ", "Аккаунт: "],
  ["Approval gate: ", "Требование одобрения: "],
  ["Billing provider: ", "Платежный провайдер: "],
  ["Billing status: ", "Статус оплаты: "],
  ["Blocker: ", "Блокер: "],
  ["Brand name: ", "Название бренда: "],
  ["Built at: ", "Собрано: "],
  ["Commit SHA: ", "SHA коммита: "],
  ["Contact email: ", "Контактный email: "],
  ["Default playbook: ", "Базовый плейбук: "],
  ["Description: ", "Описание: "],
  ["Invite link: ", "Ссылка-приглашение: "],
  ["Latest invite: ", "Последнее приглашение: "],
  ["Linked scenarios: ", "Связанные сценарии: "],
  ["Missing proof: ", "Недостающие доказательства: "],
  ["Monthly revenue band: ", "Диапазон месячной выручки: "],
  ["Next action: ", "Следующее действие: "],
  ["Open ", "Открыть "],
  ["Open blockers: ", "Открытые блокеры: "],
  ["Owner roles: ", "Роли владельцев: "],
  ["Owner: ", "Владелец: "],
  ["Primary contact: ", "Основной контакт: "],
  ["Proof guidance: ", "Подсказка по доказательствам: "],
  ["Recommended scope: ", "Рекомендуемый охват: "],
  ["Release ID: ", "ID релиза: "],
  ["Requirements satisfied: ", "Выполненные требования: "],
  ["Restricted channels: ", "Ограниченные каналы: "],
  ["Role: ", "Роль: "],
  ["Scenario type: ", "Тип сценария: "],
  ["Service: ", "Сервис: "],
  ["Source: ", "Источник: "],
  ["Starting action: ", "Стартовое действие: "],
  ["Store platform: ", "Платформа магазина: "],
  ["Summary: ", "Сводка: "],
  ["Target: ", "Цель: "],
  ["Target geography: ", "Целевая география: "],
  ["Top competitors: ", "Основные конкуренты: "],
  ["Usage notes: ", "Примечания по использованию: "],
  ["Usage: ", "Использование: "],
  ["Verified: ", "Проверено: "],
  ["Website URL: ", "URL сайта: "],
];

type PatternTranslation = {
  pattern: RegExp;
  translate: (...matches: string[]) => string;
};

function translateTimeToken(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?: ([AP]M))?$/);

  if (!match) {
    return value;
  }

  let hours = Number(match[1]);
  const minutes = match[2];
  const seconds = match[3];
  const meridiem = match[4];

  if (meridiem === "PM" && hours < 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  const hourValue = String(hours).padStart(2, "0");
  return seconds ? `${hourValue}:${minutes}:${seconds}` : `${hourValue}:${minutes}`;
}

function translateDateToken(value: string) {
  const match = value.match(
    /^(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December) (\d{1,2})(?:, (\d{4}))?(?:,? (\d{1,2}:\d{2}(?::\d{2})?(?: [AP]M)?))?$/,
  );

  if (!match) {
    return value;
  }

  const [, month, day, year, time] = match;
  const translatedMonth = RUSSIAN_MONTHS[month];

  if (!translatedMonth) {
    return value;
  }

  let translated = `${Number(day)} ${translatedMonth}`;

  if (year) {
    translated = `${translated} ${year} г.`;
  }

  if (time) {
    translated = `${translated}, ${translateTimeToken(time)}`;
  }

  return translated;
}

function translateRelativeTimeToken(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "yesterday") {
    return "вчера";
  }

  if (normalized === "tomorrow") {
    return "завтра";
  }

  const agoMatch = normalized.match(/^(\d+) (hour|hours|day|days) ago$/);

  if (agoMatch) {
    const amount = agoMatch[1];
    const unit = agoMatch[2].startsWith("hour") ? "ч." : "дн.";
    return `${amount} ${unit} назад`;
  }

  const inMatch = normalized.match(/^in (\d+) (hour|hours|day|days)$/);

  if (inMatch) {
    const amount = inMatch[1];
    const unit = inMatch[2].startsWith("hour") ? "ч." : "дн.";
    return `через ${amount} ${unit}`;
  }

  return value;
}

function translateRussianCore(value: string): string {
  const exact = RUSSIAN_EXACT_TRANSLATIONS[value];

  if (exact) {
    return exact;
  }

  const prefixed = RUSSIAN_PREFIX_TRANSLATIONS.find(([source]) => value.startsWith(source));

  if (prefixed) {
    const [source, target] = prefixed;
    const remainder = value.slice(source.length);
    return `${target}${translateRussianCore(remainder)}`;
  }

  const translatedDate = translateDateToken(value);

  if (translatedDate !== value) {
    return translatedDate;
  }

  const translatedRelativeTime = translateRelativeTimeToken(value);

  if (translatedRelativeTime !== value) {
    return translatedRelativeTime;
  }

  const patternTranslations: PatternTranslation[] = [
    {
      pattern: /^This invite grants access to the founder-led Flowvory audit workspace for (.+)\. Set your password here once, then use the normal sign-in page for future access\.$/,
      translate: (email) =>
        `Это приглашение дает доступ к рабочему пространству аудита Flowvory для ${email}. Сначала задайте пароль, затем используйте обычную страницу входа для следующих входов.`,
    },
    {
      pattern: /^Captured (.+) by (.+)$/,
      translate: (capturedAt, actor) => `Зафиксировано ${translateRussianCore(capturedAt)} пользователем ${actor}`,
    },
    {
      pattern: /^Join the (.+) workspace$/,
      translate: (workspaceName) => `Присоединиться к рабочему пространству ${workspaceName}`,
    },
    {
      pattern: /^Scenario status is (.+) and proof readiness is (.+)\.$/,
      translate: (status, proofReadiness) =>
        `Статус сценария: ${translateRussianCore(status)}. Готовность доказательств: ${translateRussianCore(proofReadiness)}.`,
    },
    {
      pattern: /^Task (.+)$/,
      translate: (status) => `Задача: ${translateRussianCore(status)}`,
    },
    {
      pattern: /^This invite grants access to the founder-led Flowvory audit workspace for (.+)\.$/,
      translate: (email) =>
        `Это приглашение дает доступ к рабочему пространству аудита Flowvory для ${email}.`,
    },
    {
      pattern: /^(\d+) intake draft handoffs?$/,
      translate: (count) => `${count} передач(и) черновика intake`,
    },
    {
      pattern: /^(.+) entered the workspace from (.+)\.$/,
      translate: (title, source) => `${title} поступил в рабочее пространство из ${translateRussianCore(source)}.`,
    },
    {
      pattern: /^(.+) is currently (.+)\.$/,
      translate: (title, status) => `${title} сейчас имеет статус ${translateRussianCore(status)}.`,
    },
    {
      pattern: /^(.+) is in (.+)\.$/,
      translate: (title, status) => `${title} находится в статусе ${translateRussianCore(status)}.`,
    },
    {
      pattern: /^(.+) was linked as (primary proof|supporting proof)\.$/,
      translate: (title, proofType) => `${title} привязан как ${translateRussianCore(proofType)}.`,
    },
    {
      pattern: /^Outcome status is (.+)\.$/,
      translate: (status) => `Статус результата: ${translateRussianCore(status)}.`,
    },
  ];

  for (const patternTranslation of patternTranslations) {
    const match = value.match(patternTranslation.pattern);

    if (match) {
      return patternTranslation.translate(...match.slice(1));
    }
  }

  return value;
}

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  if (value === "ru") {
    return "ru";
  }

  return DEFAULT_APP_LOCALE;
}

export function getIntlLocale(locale: AppLocale) {
  return INTL_LOCALE_BY_APP_LOCALE[locale];
}

export function getHtmlLang(locale: AppLocale) {
  return HTML_LANG_BY_APP_LOCALE[locale];
}

export function translateInterfaceText(text: string, locale: AppLocale) {
  if (locale === "en") {
    return text;
  }

  const match = text.match(/^(\s*)(.*?)(\s*)$/s);

  if (!match) {
    return text;
  }

  const [, leadingWhitespace, core, trailingWhitespace] = match;

  if (!core) {
    return text;
  }

  return `${leadingWhitespace}${translateRussianCore(core)}${trailingWhitespace}`;
}
