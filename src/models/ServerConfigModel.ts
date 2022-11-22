class ServerConfigModel {
  private static serverConf: object;

  /**
   * *config file validation check
   * *store config to JSON format
   * @param filePath server config file path
   */
  public static initialize(filePath: string) {
    ServerConfigModel.setServerConf(filePath);
  }

  /**
   * set server config to "serverConf"
   * @param filePath server config file path
   */
  private static setServerConf(filePath: string) {
    const fs = require("fs");

    const serverConf = JSON.parse(fs.readFileSync(filePath));

    this.serverConf = serverConf;
  }

  /**
   * read and check config file
   * @return {object} if failure, return null
   */
  public static getServerConf(): object {
    return ServerConfigModel.serverConf;
  }
}
export = ServerConfigModel;
