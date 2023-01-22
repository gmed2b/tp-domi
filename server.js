import express from 'express'
import { createClient } from '@supabase/supabase-js'

const app = express()
// Create a single supabase client for interacting with your database
const supabase = createClient(
	'https://qwubkncxqyygewuyclkw.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dWJrbmN4cXl5Z2V3dXljbGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQzOTgxMjgsImV4cCI6MTk4OTk3NDEyOH0.VWKqZgV5H0M5SSBGPbFaiVjZ20VN_-sFS7kc8tyiJWg'
)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/task', async (req, res) => {
	const tasks = await supabase.from('tasks').select(`*, subjects (name)`)
	res.send(tasks)
})
app.post('/task', async (req, res) => {
	try {
		if (!req.body) {
			throw new Error('No body')
		}
		const task = await supabase.from('tasks').insert(req.body).select(`*, subjects (name)`)
		res.status(201).send(task)
	} catch (e) {
		console.error(e)
		res.status(400).send({ message: e.message })
	}
})
app.patch('/task/:id', async (req, res) => {
	try {
		if (!req.body) {
			throw new Error('No body')
		}
		const task = await supabase.from('tasks').update(req.body).eq('id', req.params.id).select(`*, subjects (name)`)
		res.status(200).send(task)
	} catch (e) {
		console.error(e)
		res.status(400).send({ message: e.message })
	}
})
app.delete('/task/:id', async (req, res) => {
	try {
		const task = await supabase.from('tasks').delete().eq('id', req.params.id)
		res.status(200).send({ ...task, id: req.params.id })
	} catch (e) {
		console.error(e)
		res.status(400).send({ message: e.message })
	}
})

app.get('/subject', async (req, res) => {
	const subjects = await supabase.from('subjects').select()
	res.send(subjects)
})
app.post('/subject', async (req, res) => {
	try {
		if (!req.body) {
			throw new Error('No body')
		}
		const subject = await supabase.from('subjects').insert(req.body).select()
		res.status(201).send(subject)
	} catch (e) {
		res.status(400).send({ message: e.message })
	}
})
app.patch('/subject/:id', async (req, res) => {
	try {
		if (!req.body) {
			throw new Error('No body')
		}
		const subject = await supabase.from('subjects').update(req.body).eq('id', req.params.id).select()
		res.status(200).send(subject)
	} catch (e) {
		console.error(e)
		res.status(400).send({ message: e.message })
	}
})
app.delete('/subject/:id', async (req, res) => {
	try {
		const subject = await supabase.from('subjects').delete().eq('id', req.params.id)
		res.status(200).send({ ...subject, id: req.params.id })
	} catch (e) {
		console.error(e)
		res.status(400).send({ message: e.message })
	}
})

app.listen(5000, () => console.log('server start on port 5000'))
