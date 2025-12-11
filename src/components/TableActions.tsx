import Icon from './Icon'

interface PropsTypes {
    onClick: (id:unknown,type:string) => void;
    item: unknown
}

const TableActions = ({item,onClick}:PropsTypes) => {
  return (
    <div className='flex items-center gap-2'>
        <button onClick={()=>onClick(item,'delete')}><Icon name='trash'/></button>
        <button onClick={()=>onClick(item,'edit')}><Icon name='edit'/></button>
    </div>
  )
}

export default TableActions