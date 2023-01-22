const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-modal]')
const overlayElement = document.querySelector('#modal-overlay')

openModalButtons.forEach(button => {
	button.addEventListener('click', () => {
		const modal = document.querySelector(button.dataset.modalTarget)
		openModal(modal)
	})
})
closeModalButtons.forEach(button => {
	button.addEventListener('click', () => {
		const modal = button.closest('.modal')
		closeModal(modal)
	})
})
overlayElement.addEventListener('click', () => {
	const modals = document.querySelectorAll('.modal.active')
	modals.forEach(modal => {
		closeModal(modal)
	})
})

const openModal = modal => {
	if (modal == null) return
	modal.classList.add('active')
	overlayElement.classList.add('active')
}

const closeModal = modal => {
	if (modal == null) return
	modal.classList.remove('active')
	overlayElement.classList.remove('active')
}

export { openModal, closeModal }
