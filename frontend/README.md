# AutoService — поиск и добавление в одной строке

Исправлены четыре страницы: автомобили, мастера, услуги, выполненные работы.
На экранах sm и шире поле поиска находится слева, кнопка добавления/назначения справа.
На узком экране элементы располагаются вертикально.

Архив распаковывается в корень `Coursework` с сохранением путей.

В PowerShell из корня репозитория:

```powershell
Expand-Archive "$env:USERPROFILE\Downloads\autoservice_toolbar_alignment.zip" -DestinationPath . -Force
cd frontend
npm.cmd run build
npm.cmd run dev
```

Перед распаковкой проверь `git diff` и при наличии важных новых правок сохрани их.
Общий компонент `CrudUI.tsx`, модальные окна, API и backend не изменяются.
