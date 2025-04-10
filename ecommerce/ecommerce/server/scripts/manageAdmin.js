const { createOrUpdateAdmin, checkAdminUser, deleteRegularAdminUser } = require('../utils/adminUtils');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const email = args[1];
const password = args[2];
const name = args[3];

// Help function
const showHelp = () => {
  console.log(`
Usage: node manageAdmin.js <command> [options]

Commands:
  create <email> <password> <name>  Create or update an admin user
  check <email>                     Check if a user is an admin
  delete <email>                    Delete a regular admin user
  help                              Show this help message

Examples:
  node manageAdmin.js create admin@example.com password123 "Admin User"
  node manageAdmin.js check admin@example.com
  node manageAdmin.js delete admin@example.com
  node manageAdmin.js help
  `);
};

// Main function
const main = async () => {
  try {
    switch (command) {
      case 'create':
        if (!email || !password || !name) {
          console.error('Error: Email, password, and name are required for create command');
          showHelp();
          process.exit(1);
        }
        const createResult = await createOrUpdateAdmin({ email, password, name });
        console.log(createResult);
        break;

      case 'check':
        if (!email) {
          console.error('Error: Email is required for check command');
          showHelp();
          process.exit(1);
        }
        const checkResult = await checkAdminUser(email);
        console.log(checkResult);
        break;

      case 'delete':
        if (!email) {
          console.error('Error: Email is required for delete command');
          showHelp();
          process.exit(1);
        }
        const deleteResult = await deleteRegularAdminUser(email);
        console.log(deleteResult);
        break;

      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Run the script
main(); 