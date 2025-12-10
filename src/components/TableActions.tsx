import Icon from './Icon'

interface PropsTypes {
    onClick: (id:unknown,type:string) => void;
    id: unknown
}

const TableActions = ({id,onClick}:PropsTypes) => {
  return (
    <div className='flex items-center gap-2'>
        <button onClick={()=>onClick(id,'delete')}><Icon name='trash'/></button>
        <button onClick={()=>onClick(id,'edit')}><Icon name='edit'/></button>
    </div>
  )
}

export default TableActions