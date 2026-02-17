import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Data structure definitions
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

  public type UserData = {
    prompts : Map.Map<Text, Prompt>;
    categories : Map.Map<Text, Category>;
  };

  public type UserProfile = {
    name : Text;
  };

  // Actor state
  let usersData = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Mixin for authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Connectivity check - accessible to all callers including guests
  public query ({ caller }) func backendConnectivityCheck() : async () {};

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to get or initialize user data (for update calls)
  func getOrCreateUserData(user : Principal) : UserData {
    switch (usersData.get(user)) {
      case (null) {
        let newUserData = {
          prompts = Map.empty<Text, Prompt>();
          categories = Map.empty<Text, Category>();
        };
        usersData.add(user, newUserData);
        newUserData;
      };
      case (?data) { data };
    };
  };

  // Helper function to get user data without creating (for query calls)
  func getUserData(user : Principal) : ?UserData {
    usersData.get(user);
  };

  // CRUD operations for Prompts
  public shared ({ caller }) func savePrompt(prompt : Prompt) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save prompts");
    };

    let userData = getOrCreateUserData(caller);
    userData.prompts.add(prompt.id, prompt);
  };

  public query ({ caller }) func getPrompt(promptId : Text) : async ?Prompt {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch prompts");
    };

    switch (getUserData(caller)) {
      case (null) { null };
      case (?userData) { userData.prompts.get(promptId) };
    };
  };

  public query ({ caller }) func getAllPrompts() : async [Prompt] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch prompts");
    };

    switch (getUserData(caller)) {
      case (null) { [] };
      case (?userData) { userData.prompts.values().toArray() };
    };
  };

  public shared ({ caller }) func deletePrompt(promptId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete prompts");
    };

    let userData = getOrCreateUserData(caller);
    userData.prompts.remove(promptId);
  };

  // CRUD operations for Categories
  public shared ({ caller }) func saveCategory(category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save categories");
    };

    let userData = getOrCreateUserData(caller);
    userData.categories.add(category.id, category);
  };

  public shared ({ caller }) func updateCategoryName(oldName : Text, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update category names");
    };

    let userData = getOrCreateUserData(caller);
    let categories = userData.categories;

    switch (categories.get(oldName)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) {
        // Update the category name
        let updatedCategory = {
          id = category.id;
          name = newName;
          description = category.description;
        };

        // Remove the old category and add the new one
        categories.remove(oldName);
        categories.add(newName, updatedCategory);

        // Update prompts to reference the new category name
        let prompts = userData.prompts;
        for ((id, prompt) in prompts.entries()) {
          let updatedCategories = List.fromArray(prompt.categories).map(
            func(categoryName) {
              if (categoryName == oldName) {
                newName;
              } else {
                categoryName;
              };
            }
          ).toArray();

          let updatedPrompt = {
            id = prompt.id;
            title = prompt.title;
            content = prompt.content;
            author = prompt.author;
            categories = updatedCategories;
            tags = prompt.tags;
          };

          prompts.add(id, updatedPrompt);
        };
      };
    };
  };

  public query ({ caller }) func getCategory(categoryId : Text) : async ?Category {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch categories");
    };

    switch (getUserData(caller)) {
      case (null) { null };
      case (?userData) { userData.categories.get(categoryId) };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch categories");
    };

    switch (getUserData(caller)) {
      case (null) { [] };
      case (?userData) { userData.categories.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete categories");
    };

    let userData = getOrCreateUserData(caller);

    // Detach category from prompts
    let prompts = userData.prompts;
    for ((id, prompt) in prompts.entries()) {
      let filteredCategories = List.fromArray(prompt.categories).filter(
        func(categoryName) {
          categoryName != categoryId;
        }
      ).toArray();

      let updatedPrompt = {
        id = prompt.id;
        title = prompt.title;
        content = prompt.content;
        author = prompt.author;
        categories = filteredCategories;
        tags = prompt.tags;
      };

      prompts.add(id, updatedPrompt);
    };

    // Remove category
    userData.categories.remove(categoryId);
  };

  // Search functionality
  public query ({ caller }) func searchPrompts(searchTerm : Text) : async [Prompt] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search prompts");
    };

    switch (getUserData(caller)) {
      case (null) { [] };
      case (?userData) {
        let resultsList = List.empty<Prompt>();

        userData.prompts.values().forEach(
          func(prompt) {
            if (
              prompt.title.contains(#text searchTerm) or
              prompt.content.contains(#text searchTerm) or
              prompt.author.contains(#text searchTerm)
            ) {
              resultsList.add(prompt);
            };
          }
        );

        resultsList.toArray();
      };
    };
  };
};
