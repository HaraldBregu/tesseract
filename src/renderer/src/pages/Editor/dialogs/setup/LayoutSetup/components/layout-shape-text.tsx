interface ILayoutShapeText{
    layout: string
}

const LayoutShapeText = ({layout}:ILayoutShapeText) =>(
    <div className={`w-full h-[90%] p-4 border border-secondary[85] flex ${layout==='vertical-vertical' && "flex-row gap-3"}`}>
      <div className={`${layout==='vertical-horizontal' ? "w-full" : "w-1/2"} h-full bg-primary-foreground`}/>
      {layout==='vertical-vertical' && <div className={`w-1/2 h-full bg-primary-foreground`}/> }
    </div>
  );



export default LayoutShapeText