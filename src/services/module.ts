import Module, { ModuleType } from '../models/Module';
import destructureDocument from './destructureDocument';

export const deleteModule = async (moduleId: string) => {
  const moduleDoc = await Module.findOneAndDelete({id: moduleId})
  if(moduleDoc != null){
    for(let childId of moduleDoc.childrenIds){
      await deleteModule(childId);
    }
  }
  return moduleDoc;
};

export const constructModule = async (moduleId: string): Promise<ModuleType> => {
  const moduleDoc = await Module.findOne({id: moduleId});

  const {childrenIds, ...rest} = destructureDocument(moduleDoc);
  const children = []; for(let id of childrenIds) children.push(await constructModule(id))

  const module: ModuleType = {
    ...rest,
    children: children
  }

  return module;
};

export const deconstructModule = async (module: ModuleType) => {
  const { children, ...rest} = module;

  const moduleDoc = new Module({
    ...rest,
    childrenIds: children.map((child: ModuleType) => child.id)
  })
  await moduleDoc.save();

  for(let mod of children){
    await deconstructModule(mod);
  }
  return moduleDoc;
};
