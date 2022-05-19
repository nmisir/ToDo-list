export class Todo
{
    constructor(options, storageKey = null)
    {
        if(options == undefined){
            options = {
                taskInput: '#taskInput',
                addBtn: '#addBtn',
                list: '#list',
                saveBtn: '#saveBtn',
                deleteBtn: '#deleteBtn'
            };
        }

        try {
            for (const property in options){

                if(document.querySelector(options[property]) == null){
                    throw 'Can\'t instance all properties, some identifier are missing'; 
                }

                this[property] = document.querySelector(options[property]);
            }
        } catch (error) {
            console.error(error);
        }

        this.storageKey = storageKey || 'tasks';
    }
    // Inicijalizacija aplikacije
    init()
    {
        this.checkStorage();
        this.addListeners();
    }
    // Provjeri da li ima spremljena lista u lokalnoj pohrani i ako ima, rekonstruiraj listu
    checkStorage()
    {
        if(window.localStorage !== undefined){
            const items = localStorage.getItem(this.storageKey);

            if(items !== null){
                const tasks = JSON.parse(items);

                for (const [key, value] of Object.entries(tasks)) {
                    const item = this.createTaskItem(value.title);
                          item.dataset.createDate = value.createDate;
                    
                    if(value.doneDate){
                        item.classList.add('done');
                        item.firstChild.checked = true;
                        //item.querySelector('input[type="checkbox"]').checked = true;
                        item.dataset.doneDate = value.doneDate;
                        item.lastChild.disabled = true;
                        //item.querySelector('button[type="button"]').disabled = true;
                    }
                    
                    this.list.append(item);
                }
            }
            
        } else {
            alert('Tvoj preglednik ne podržava lokalnu pohranu!');
        }
    }
    // Dodavanje event listenera
    addListeners()
    {
        this.taskInput != undefined ? this.taskInput.addEventListener('keyup', this.pressEnter) : false;
        this.addBtn != undefined ? this.addBtn.addEventListener('click', this.addNewTask) : false;
        this.saveBtn != undefined ? this.saveBtn.addEventListener('click', this.saveList) : false;
        this.deleteBtn != undefined ? this.deleteBtn.addEventListener('click', this.deleteList) : false;

        //window.addEventListener('beforeunload', this.checkListStatus);
        window.onbeforeunload = this.checkListStatus();
    }
    // Sprema listu taskova u lokalnu pohranu
    saveList = (event) => {
        event.preventDefault();

        if(window.localStorage !== undefined){
            const items = this.list.querySelectorAll('li');
            
            if(items.length > 0){
                const tasks = this.createTasksObject(items);
                localStorage.setItem(this.storageKey, JSON.stringify(tasks));

                return;
            }

            alert('Nisi dodao niti jedan task!!!');

        } else {
            alert('Tvoj preglednik ne podržava lokalnu pohranu!');
        }
    }
    // Kreiraj objekt taskova
    createTasksObject(items){
        const tasks = {};

        for (let i = 0; i < items.length; i++) {
            const firstChild = items[i].firstChild;
            const doneDate = (items[i].dataset.doneDate) ? items[i].dataset.doneDate : null;

            tasks['task' + (i + 1)] = {
                title: firstChild.nextSibling.textContent,
                done: firstChild.checked,
                createDate: items[i].dataset.createDate,
                doneDate: doneDate
            }
        }

        return tasks;
    }
    // Briše listu taskova iz lokalne pohrane i na ekranu
    deleteList = (event) => {
        event.preventDefault();

        if(confirm("Da li siguran?")){
            // Nije preporučeno da se koristi ako child elementi imaju event listener
            // this.list.innerHTML = '';

            while (this.list.firstChild) {
                this.list.removeChild(this.list.firstChild);
            }

            localStorage.removeItem(this.storageKey);
        }
    }
    // Provjeri status liste prije reload-a ili gašenja aplikacije
    checkListStatus = (event) => {
        if(!this.jsonIsEqual()){
            alert('bla');
            return true;
        }

        return false;
    }
    // Provjeri dva json formata
    jsonIsEqual(){
        const items = this.list.querySelectorAll('li');
        console.log(items);
        const tasksObject = this.createTasksObject(items);

        const tasks = (Object.keys(tasksObject).length !== 0) ? JSON.stringify(this.createTasksObject(items)) : null;
        const storageTasks = localStorage.getItem(this.storageKey);

        return tasks == storageTasks;  
    }
    // Dodavanje novog taska pritiskom na tipku enter
    pressEnter = (event) =>
    {
        if(event.key === 'Enter'){
            this.addNewTask(event);
        }
    }
    // Dodavanje novog taska u listu
    addNewTask = (event) =>
    {
        event.preventDefault();

        const task = this.taskInput.value;

        if(!task){
            alert('Enter a task');
            return;
        }
        
        const taskItem = this.createTaskItem(task);

        this.list.prepend(taskItem);

        this.resetTaskInput();
    }
    // Kreiranje novog elementa liste kao novi task
    createTaskItem(task)
    {
        const item = document.createElement('li');
              item.innerText = task;
              item.dataset.createDate = this.createTimestamp();

        this.insertCheckbox(item);
        this.insertRemoveTaskBtn(item);

        return item;
    }
    // Umetni checkbox u li element
    insertCheckbox(item)
    {
        const checkbox = document.createElement('input');
              checkbox.setAttribute('type', 'checkbox');
              checkbox.addEventListener('change', this.toggleDone);

        item.prepend(checkbox);
    }
    // Umetni gumb u li element
    insertRemoveTaskBtn(item)
    {
        const btn = document.createElement('button');
              btn.setAttribute('type', 'button');
              btn.setAttribute('title', 'Remove task from list');
              btn.innerText = 'X';
              btn.addEventListener('click', this.removeTask);

        item.append(btn);
    }
    // Označi task rješenim/nerješenim
    toggleDone = (event) =>
    {
        const checkbox = event.target;
        const item = checkbox.parentNode;

        item.classList.toggle('done');

        if(checkbox.checked){
            item.dataset.doneDate = this.createTimestamp();
            item.lastChild.disabled = true;
        } else {
            item.dataset.doneDate = "";
            item.lastChild.disabled = false;
        }
    }
    // Izbriši task iz liste
    removeTask = (event) => {
        const btn = event.target;
        const item = btn.parentNode;

        if(!item.classList.contains('done')){
            item.remove();
        }
    }

    /* HELPERS */
    // Izbriši tekst u input polju i napravi fokus na njega
    resetTaskInput()
    {
        this.taskInput.value = "";
        this.taskInput.focus();
    }
    // Kreiraj timestamp
    createTimestamp()
    {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minutes = date.getMinutes();

        return `${year}-${month}-${day} ${hour}:${minutes}`;
    }
}