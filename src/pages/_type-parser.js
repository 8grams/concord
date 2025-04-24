import peggy from "peggy";

export const parser = peggy.generate(`
  Type
    = List
    / Map
    / Object
    / Scalar

  Map
    = 'map(' type:Type ')'
      { return { tag: 'map', type } }

  List
    = 'list(' type:Type ')'
      { return { tag: 'list', type } }

  Object
    = 'object({' props:( _  @Prop )+ _ '})'
      { return { tag: 'object', props } }
  
  Prop
    = name:ID _ '=' _ type:Type
      { return { name, type } }

  Scalar
    = tag:ID
      { return { tag } }

  ID 
    = $( [a-z_]i [a-z_]i* )

  _
    = [ \\t\\r\\n]*
`);
