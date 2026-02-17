import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

module {
  // Old actor type (was empty)
  type OldActor = {};

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

  type NewActor = {
    usersData : Map.Map<Principal, UserData>;
  };

  public func run(_old : OldActor) : NewActor {
    { usersData = Map.empty<Principal, UserData>() };
  };
};
