import React from 'react'
import {Icon} from 'antd'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import _ from 'lodash'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  // userSelect: "none",
  // margin: `0 ${grid}px 0 0`,
  // padding: '10px',
  // // change background colour if dragging
  // background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  // background: isDraggingOver ? "lightblue" : "lightgrey",
  // display: 'flex',
  // height: '30px'
});
export default class Tab extends React.Component {
  constructor(p) {super(p)}
  state = {
    items: [],
    ids: {}
  }
  initState = () => {
    const {files} = this.props
    let hasChange = false
    let {items, ids} = this.state
    console.log(files, items, ids)
    Object.keys(files).map(id => {
      // open file
      if(!ids[id] && files[id].opened) {
        hasChange = true
        ids[id] = 1;
        items.push({
          id,
          name: files[id].name,
          changed: false
        })
      }
      // close file
      if(ids[id] && !files[id].opened) {
        hasChange = true
        items = items.filter(item => item.id !== id)
        delete ids[id]
      }
      // file changed
      // update property from files
      // if(ids[id]) {
      //   items.forEach((item, index) => {
      //     // if(item.id === id && item.changed !== files[id].changed) {
      //       // hasChange = true;
      //       items[index] = {
      //         ...items[index],
      //         name: files[id].name,
      //         changed: files[id].changed
      //       }
      //     // }
      //   })
      // }

    })


    // update change
    items.forEach((item, index) => {
      if(!files[item.id]) {
        console.log('aaa')
        // hasChange = true;
        // items = items.filter(_item => _item.id !== item.id)
      }
      if(files[item.id] && !_.isEqual(items[index], files[item.id])) {
        hasChange = true
        items[index] = {
          ...items[index],
          ...files[item.id]
        }
      }
    })

    if(hasChange) {
    	this.setState({
        items,
        ids
      });
    }
  }

  componentDidMount() {
    this.initState()
  }

  componentDidUpdate(prevProps) {
    this.initState()
  }

  onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      items
    });
  }
  removeTab = (e, id) => {
    e.stopPropagation();
    setTimeout(() => {
      this.props.onUnselectFile(id)
    }, 200)
    // let {items, ids, selectedStack} = this.state
    // items = items.filter(item => item.id !== id)
    // delete ids.id
    // selectedStack = selectedStack.filter(_id => _id !== id)
    //  this.props.onSelectFile(selectedStack.length > 0 ? selectedStack[selectedStack.length - 1] : null)
    // this.setState({items, ids, selectedStack})
  }

  render() {
    const {items} = this.state
    const {selected, onSelectFile} = this.props
  	return <DragDropContext onDragEnd={this.onDragEnd} className="fe-tab">
      <Droppable droppableId="editor-tab-droppable" direction="horizontal">
        {(provided, snapshot) => (
          <div
          	className="fe-tab__container"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    onMouseDown={() => onSelectFile(item.id)}
                  	className={`fe-tab__item ${selected} ${item.id} ${selected==item.id ? 'fe-tab__item--focused' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    {item.changed && <Icon type="edit" className="fe-tab__item__changed" /> }{' '}
                    {item.name}
                    <Icon type="close" className="fe-tab__item__close" onMouseDown={e => this.removeTab(e, item.id)}/>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  }

}