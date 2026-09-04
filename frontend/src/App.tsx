import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NewTaskForm from './components/NewTaskForm'
import TaskList from './components/TaskList'

export default function App() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 6 } }}>
      <Stack spacing={3}>
        <Typography variant="h1" component="h1">
          Task list
        </Typography>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1}>
            <NewTaskForm />
            <TaskList />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
