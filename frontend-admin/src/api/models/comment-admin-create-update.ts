/* tslint:disable */
/* eslint-disable */
/**
 * BSS Request Manager API
 * REST API for Workflow Support System for managing video shooting, filming and live streaming requests of Budavári Schönherz Stúdió.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: kecskemety.oliver@simonyi.bme.hu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// May contain unused imports in some cases
// @ts-ignore
import { UserNestedList } from './user-nested-list';

/**
 *
 * @export
 * @interface CommentAdminCreateUpdate
 */
export interface CommentAdminCreateUpdate {
  /**
   *
   * @type {UserNestedList}
   * @memberof CommentAdminCreateUpdate
   */
  author: UserNestedList;
  /**
   *
   * @type {string}
   * @memberof CommentAdminCreateUpdate
   */
  created: string;
  /**
   *
   * @type {number}
   * @memberof CommentAdminCreateUpdate
   */
  id: number;
  /**
   *
   * @type {boolean}
   * @memberof CommentAdminCreateUpdate
   */
  internal?: boolean;
  /**
   *
   * @type {string}
   * @memberof CommentAdminCreateUpdate
   */
  text: string;
}
