import { useState } from 'react'
import TickIcon from './TickIcon'
import Modal from './Modal'
import ProgressBar from './ProgressBar'
import { useCookies } from 'react-cookie'

const ListItem = ({ task, getData }) => {
  const [showModal, setShowModal] = useState(false)
  const [cookies] = useCookies(['AuthToken']);
  const authToken = cookies.AuthToken;
  const email=cookies.Email;

  const deleteItem = async() => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos/${task.id}`, {
        method: 'DELETE',  headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          "email":`${email}`
        },
      })
      if (response.status === 200) {
        getData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <li className="list-item">
      
      <div className="info-container">
        <TickIcon/>
        <p className="task-title">{task.title}</p>
        <ProgressBar progress={task.progress}/>
      </div>

      <div className="button-container">
        <button className="edit" onClick={() => setShowModal(true)}>EDIT</button>
        <button className="delete" onClick={deleteItem}>DELETE</button>
      </div>
      {showModal && <Modal mode={'edit'} setShowModal={setShowModal} getData={getData} task={task} />}
    </li>
  )
}

export default ListItem