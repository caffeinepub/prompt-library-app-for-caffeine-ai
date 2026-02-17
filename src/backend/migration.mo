import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type Prompt = {
    id : Text;
    title : Text;
    content : Text;
    author : Text;
    categories : [Text];
    tags : [Text];
  };

  type Category = {
    id : Text;
    name : Text;
    description : Text;
  };

  type UserData = {
    prompts : Map.Map<Text, Prompt>;
    categories : Map.Map<Text, Category>;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    usersData : Map.Map<Principal, UserData>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    usersData : Map.Map<Principal, UserData>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
