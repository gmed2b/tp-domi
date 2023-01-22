import { closeModal } from './modal.js'

let tasksList = []
let subjectsList = []
let defaultSortField = localStorage.getItem('mg.defaultSortField') || 'name'

saveAndRender()

/*
 FUNCTIONS
 */

const sortableColumns = document.querySelectorAll('[data-sortable]')
sortableColumns.forEach(column => {
	if (column.dataset.sortable === defaultSortField) {
		column.classList.add('active')
	}
	column.addEventListener('click', e => {
		sortableColumns.forEach(c => c.classList.remove('active'))
		const field = e.target.dataset.sortable
		const asc = !column.classList.contains('asc')
		sortTasksBy(field, asc)
		if (asc) {
			column.classList.add('asc')
			column.classList.remove('desc')
		} else {
			column.classList.add('desc')
			column.classList.remove('asc')
		}
		column.classList.toggle('active')
	})
})

const addTaskForm = document.querySelector('#add-task-form')
addTaskForm.addEventListener('submit', async e => {
	e.preventDefault()
	const data = new FormData(e.target)
	// create new task with form data
	const newTask = await createNewTask(data)
	// add new task to tasks list
	tasksList.push(newTask)
	// reset form, close modal and save and render
	addTaskForm.reset()
	closeModal(addTaskForm.closest('.modal'))
	saveAndRender()
})

const addSubjectForm = document.querySelector('#add-subject-form')
addSubjectForm.addEventListener('submit', async e => {
	e.preventDefault()
	const data = new FormData(e.target)
	const newSubject = await createNewSubject(data)
	subjectsList.push(newSubject)
	addSubjectForm.reset()
	closeModal(addSubjectForm.closest('.modal'))
	saveAndRender()
})

async function save() {
	const fetchTasks = await fetch('/task')
	const tasksData = await fetchTasks.json()
	tasksList = tasksData.data
	const fetchSubjects = await fetch('/subject')
	const subjectsData = await fetchSubjects.json()
	subjectsList = subjectsData.data
}

function render() {
	renderTasksList()
	renderSubjectsList()
}

async function saveAndRender() {
	console.log('stat fetching')
	await save()
	console.log('fetching done')
	render()
}

function renderTasksList() {
	const tasksListElement = document.querySelector('#tasks-list')
	const taskItemTemplate = document.querySelector('#task-item-template')

	while (tasksListElement.firstChild !== null) {
		tasksListElement.removeChild(tasksListElement.firstChild)
	}

	// set tasks count
	const tasksCountElement = document.querySelector('[data-task-count]')
	tasksCountElement.textContent = tasksList.length

	tasksList.forEach(task => {
		const taskTemplate = document.importNode(taskItemTemplate.content, true)
		taskTemplate.querySelector('[data-task-id]').id = task.id
		taskTemplate.querySelector('[data-task-id]').classList.toggle('completed', task.completedAt !== null)
		taskTemplate.querySelector('[data-task-name]').textContent = task.name
		taskTemplate.querySelector('[data-task-description]').textContent = task.description
		taskTemplate.querySelector('[data-task-subject]').textContent = task.subjects.name
		taskTemplate.querySelector('[data-task-due-date]').textContent = task.dueDate
		taskTemplate.querySelector('[data-task-priority]').textContent = task.priority ?? 'Aucune'

		const terminateTaskButton = taskTemplate.querySelector('#terminate-task-button')
		terminateTaskButton.addEventListener('click', completeTask)

		const deleteTaskButton = taskTemplate.querySelector('#delete-task-button')
		deleteTaskButton.addEventListener('click', deleteTask)

		if (task.completedAt !== null) {
			const actionsElement = taskTemplate.querySelector('[data-task-actions]')
			actionsElement.firstElementChild.remove()
			const completedAtElement = document.createElement('span')
			completedAtElement.textContent = `Completed at ${new Date(task.completedAt).toLocaleString()}`
			actionsElement.insertBefore(completedAtElement, actionsElement.firstChild)
			actionsElement.style.color = 'rgb(30, 234, 0)'
		}
		tasksListElement.appendChild(taskTemplate)
	})
}

function renderSubjectsList() {
	const subjectsListElement = document.querySelector('#task-subject')

	// remove all options except the first one
	while (subjectsListElement.lastElementChild !== subjectsListElement.firstElementChild) {
		subjectsListElement.removeChild(subjectsListElement.lastChild)
	}

	subjectsList.forEach(subject => {
		const subjectElement = document.createElement('option')
		subjectElement.value = subject.id
		subjectElement.textContent = subject.name
		subjectsListElement.appendChild(subjectElement)
	})
}

function sortTasksBy(field, asc = true) {
	defaultSortField = field
	tasksList.sort((a, b) => {
		let valueA, valueB
		valueA = a[field]
		valueB = b[field]
		if (field === 'subject') {
			valueA = a[field].name
			valueB = b[field].name
		}
		if (asc) {
			return valueA > valueB ? 1 : -1
		} else {
			return valueA < valueB ? 1 : -1
		}
	})
	render()
}

async function createNewSubject(formData) {
	try {
		const req = await fetch('/subject', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			mode: 'cors',
			cache: 'default',
			body: JSON.stringify({
				name: formData.get('subject-name')
			})
		})
		const data = await req.json()
		if (data.error) {
			throw new Error(data.error)
		}
		return data.data[0]
	} catch (e) {
		console.error(e)
	}
}

async function createNewTask(formData) {
	try {
		const req = await fetch('/task', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: formData.get('task-name'),
				description: formData.get('task-description'),
				subjectId: formData.get('task-subject'),
				dueDate: formData.get('task-due-date'),
				priority: formData.get('task-priority')
			})
		})
		const data = await req.json()
		if (data.error) {
			throw new Error(data.error)
		}
		return data.data[0]
	} catch (e) {
		console.error(e)
	}
}

async function completeTask(e) {
	const id = e.target.closest('[data-task-id]').id
	try {
		const req = await fetch(`/task/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				completedAt: new Date().toISOString()
			})
		})
		const data = await req.json()
		if (data.error) {
			throw new Error(data.error)
		}

		const taskElement = document.getElementById(id)
		taskElement.classList.add('completed')
	} catch (e) {
		console.error(e)
	}
	await saveAndRender()
}

async function deleteTask(e) {
	const id = e.target.closest('[data-task-id]').id
	try {
		const req = await fetch(`/task/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		const data = await req.json()
		if (data.error) {
			throw new Error(data.error)
		}
	} catch (e) {
		console.error(e)
	}
	await saveAndRender()
}
