import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  // Old Prompt type with categories as Text array
  type OldPrompt = {
    id : Text;
    title : Text;
    content : Text;
    author : Text;
    categories : [Text];
    tags : [Text];
  };

  // Old Category type with id field
  type OldCategory = {
    id : Text;
    name : Text;
    description : Text;
  };

  // Old UserData type
  type OldUserData = {
    prompts : Map.Map<Text, OldPrompt>;
    categories : Map.Map<Text, OldCategory>;
  };

  // Old Actor state
  type OldActor = {
    usersData : Map.Map<Principal, OldUserData>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  // New Category type without id field
  type NewCategory = {
    name : Text;
    description : Text;
  };

  // New UserData type
  type NewUserData = {
    prompts : Map.Map<Text, OldPrompt>;
    categories : Map.Map<Text, NewCategory>;
  };

  // New Actor state
  type NewActor = {
    usersData : Map.Map<Principal, NewUserData>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let newUsersData = old.usersData.map<Principal, OldUserData, NewUserData>(
      func(_principal, oldUserData) {
        let newCategories = oldUserData.categories.map<Text, OldCategory, NewCategory>(
          func(_id, oldCategory) {
            {
              name = oldCategory.name;
              description = oldCategory.description;
            };
          }
        );
        {
          prompts = oldUserData.prompts;
          categories = newCategories;
        };
      }
    );
    {
      usersData = newUsersData;
      userProfiles = old.userProfiles;
    };
  };
};
