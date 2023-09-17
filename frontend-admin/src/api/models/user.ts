/* tslint:disable */
/* eslint-disable */
/**
 * BSS Request Manager API
 * REST API for Workflow Support System for managing video shooting, filming and live streaming requests of Budavári Schönherz Stúdió.
 *
 * The version of the OpenAPI document: 0.1.0
 * Contact: kecskemety.oliver@simonyi.bme.hu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// May contain unused imports in some cases
// @ts-ignore
import { UserProfile } from './user-profile';
// May contain unused imports in some cases
// @ts-ignore
import { UserSocialAuth } from './user-social-auth';

/**
 *
 * @export
 * @interface User
 */
export interface User {
  /**
   *
   * @type {string}
   * @memberof User
   */
  email?: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  first_name?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof User
   */
  groups: Array<string>;
  /**
   *
   * @type {number}
   * @memberof User
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof User
   */
  last_name?: string;
  /**
   *
   * @type {UserProfile}
   * @memberof User
   */
  profile: UserProfile;
  /**
   *
   * @type {string}
   * @memberof User
   */
  role: string;
  /**
   *
   * @type {Array<UserSocialAuth>}
   * @memberof User
   */
  social_accounts: Array<UserSocialAuth>;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @type {string}
   * @memberof User
   */
  username: string;
}