<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $BaseEntry
 * @property string|null $ItemCode
 * @property string|null $Qty
 * @property string|null $Body
 * @property int|null $DocNum
 * @property int|null $DocEntry
 * @property int $Status
 * @property string|null $Factorys
 * @property string|null $SPDich
 * @property string|null $CDTT
 * @property string|null $TO
 * @property string|null $Type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs query()
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereBaseEntry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereCDTT($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereDocEntry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereDocNum($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereFactorys($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereItemCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereSPDich($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereTO($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AllocateLogs whereUpdatedAt($value)
 */
	class AllocateLogs extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $PlanID
 * @property float $TotalMau
 * @property float $TLMoTop
 * @property float $TLCong
 * @property int $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Disability newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Disability newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Disability query()
 * @method static \Illuminate\Database\Eloquent\Builder|Disability whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Disability whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Disability whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Disability wherePlanID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Disability whereTLCong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Disability whereTLMoTop($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Disability whereTotalMau($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Disability whereUpdatedAt($value)
 */
	class Disability extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $PlanID
 * @property int $refID
 * @property float $SLPallet
 * @property float $SLMau
 * @property float $SLMoTop
 * @property float $SLCong
 * @property string|null $note
 * @property int $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail wherePlanID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereRefID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereSLCong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereSLMau($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereSLMoTop($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereSLPallet($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisabilityDetail whereUpdatedAt($value)
 */
	class DisabilityDetail extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @method static \Illuminate\Database\Eloquent\Builder|DryingOvens newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DryingOvens newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DryingOvens query()
 */
	class DryingOvens extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $LSX
 * @property string|null $itemchild
 * @property string|null $to
 * @property float|null $quantity
 * @property int|null $ObjType
 * @property string|null $DocEntry
 * @property string|null $LL
 * @property string|null $HXL
 * @property string|null $SPDich
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int $isQualityCheck
 * @property int|null $notiId
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL query()
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereDocEntry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereHXL($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereIsQualityCheck($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereItemchild($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereLL($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereLSX($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereNotiId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereObjType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereSPDich($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|HistorySL whereUpdatedAt($value)
 */
	class HistorySL extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|LoaiLoi newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|LoaiLoi newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|LoaiLoi query()
 * @method static \Illuminate\Database\Eloquent\Builder|LoaiLoi whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LoaiLoi whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LoaiLoi whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LoaiLoi whereUpdatedAt($value)
 */
	class LoaiLoi extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $palletID
 * @property string $Code
 * @property string|null $LoaiGo
 * @property string|null $MaLo
 * @property string|null $LyDo
 * @property string|null $QuyCach
 * @property string|null $NgayNhap
 * @property int $status
 * @property int $is_active
 * @property string|null $DocNum
 * @property string|null $DocEntry
 * @property string|null $CreateBy
 * @property float|null $IssueNumber
 * @property float|null $ReceiptNumber
 * @property int|null $flag
 * @property string|null $palletSAP
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $LoadedBy
 * @property string|null $LoadedIntoKilnDate
 * @property int|null $activeStatus
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\pallet_details> $details
 * @property-read int|null $details_count
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet query()
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereActiveStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereCreateBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereDocEntry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereDocNum($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereFlag($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereIssueNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereLoadedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereLoadedIntoKilnDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereLoaiGo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereLyDo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereMaLo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereNgayNhap($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet wherePalletID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet wherePalletSAP($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereQuyCach($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereReceiptNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereUpdatedAt($value)
 */
	class Pallet extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $PlantID
 * @property string $Code
 * @property string|null $Name
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Plants newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Plants newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Plants query()
 * @method static \Illuminate\Database\Eloquent\Builder|Plants whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plants whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plants whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plants whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plants wherePlantID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plants whereUpdatedAt($value)
 */
	class Plants extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|QCHandle newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|QCHandle newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|QCHandle query()
 * @method static \Illuminate\Database\Eloquent\Builder|QCHandle whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|QCHandle whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|QCHandle whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|QCHandle whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|QCHandle whereUpdatedAt($value)
 */
	class QCHandle extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $Code
 * @property string|null $Name
 * @property string|null $type
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons query()
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reasons whereUpdatedAt($value)
 */
	class Reasons extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $FatherCode
 * @property string $ItemCode
 * @property float $CompleQty
 * @property float $RejectQty
 * @property float|null $CDay
 * @property float|null $CRong
 * @property float|null $CDai
 * @property string $Team
 * @property string $NexTeam
 * @property string $status
 * @property string|null $ObjType
 * @property string|null $Reason
 * @property string|null $DocEntry
 * @property string $Type
 * @property string $create_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $CongDoan
 * @property string|null $ItemName
 * @property string|null $LSX
 * @property float|null $openQty
 * @property string|null $MaThiTruong
 * @property mixed $c_dai
 * @property mixed $c_day
 * @property mixed $c_rong
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong query()
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereCDai($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereCDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereCRong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereCompleQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereCongDoan($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereCreateBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereDocEntry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereFatherCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereItemCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereItemName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereLSX($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereMaThiTruong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereNexTeam($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereObjType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereOpenQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereRejectQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereTeam($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SanLuong whereUpdatedAt($value)
 */
	class SanLuong extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $user_sap
 * @property string|null $password_sap
 * @property string|null $url_sapapp
 * @property string|null $token_sap
 * @property string|null $user_db
 * @property string|null $password_db
 * @property string|null $token_db
 * @property string|null $url_sapdb
 * @property string|null $dbname
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Settings newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Settings newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Settings query()
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereDbname($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings wherePasswordDb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings wherePasswordSap($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereTokenDb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereTokenSap($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereUrlSapapp($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereUrlSapdb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereUserDb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Settings whereUserSap($value)
 */
	class Settings extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string|null $gender
 * @property string $email
 * @property string $password
 * @property string|null $role
 * @property string|null $avatar
 * @property string|null $plant
 * @property string|null $sap_id
 * @property string|null $integration_id
 * @property string|null $other_info
 * @property string|null $branch
 * @property int $is_block
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $imagesign
 * @property string $username
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @method static \Illuminate\Database\Eloquent\Builder|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereAvatar($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereBranch($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereGender($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereImagesign($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereIntegrationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereIsBlock($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereOtherInfo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePlant($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereSapId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereUsername($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $WhsCode
 * @property string|null $WhsName
 * @property string|null $branch
 * @property string|null $flag
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $FAC
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse query()
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse whereBranch($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse whereFAC($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse whereFlag($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse whereWhsCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Warehouse whereWhsName($value)
 */
	class Warehouse extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $palletID
 * @property string|null $ItemCode
 * @property string|null $BatchNumber
 * @property string|null $Quantity
 * @property float|null $CDai
 * @property float|null $CRong
 * @property float|null $CDay
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum query()
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereBatchNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereCDai($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereCDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereCRong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereItemCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum wherePalletID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|batchnum whereUpdatedAt($value)
 */
	class batchnum extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $LSX
 * @property string|null $itemchild
 * @property string|null $to
 * @property float|null $quantity
 * @property int|null $ObjType
 * @property string|null $DocEntry
 * @property string|null $LL
 * @property string|null $HXL
 * @property string|null $SPDich
 * @property int $isQualityCheck
 * @property int|null $notiId
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN query()
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereDocEntry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereHXL($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereIsQualityCheck($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereItemchild($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereLL($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereLSX($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereNotiId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereObjType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereSPDich($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|historySLVCN whereUpdatedAt($value)
 */
	class historySLVCN extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $PlanID
 * @property int|null $refID
 * @property int $value
 * @property string $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails query()
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails wherePlanID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails whereRefID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humidityDetails whereValue($value)
 */
	class humidityDetails extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $PlanID
 * @property float $rate
 * @property int $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $note
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys query()
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys wherePlanID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys whereRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|humiditys whereUpdatedAt($value)
 */
	class humiditys extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int|null $PlanID
 * @property string|null $M1
 * @property string|null $M2
 * @property string|null $M3
 * @property string|null $M4
 * @property string|null $M5
 * @property string|null $Q1
 * @property string|null $Q2
 * @property string|null $Q3
 * @property string|null $Q4
 * @property string|null $Q5
 * @property string|null $Q6
 * @property string|null $Q7
 * @property string|null $Q8
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked query()
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereM1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereM2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereM3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereM4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereM5($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked wherePlanID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereQ1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereQ2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereQ3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereQ4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereQ5($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereQ6($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereQ7($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereQ8($value)
 * @method static \Illuminate\Database\Eloquent\Builder|logchecked whereUpdatedAt($value)
 */
	class logchecked extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $text
 * @property string|null $Quantity
 * @property int $deleted
 * @property string|null $baseID
 * @property string|null $SPDich
 * @property string|null $SubItemCode
 * @property string|null $SubItemName
 * @property string|null $QuyCach
 * @property string|null $LYDO
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $team
 * @property int $type
 * @property int|null $confirm
 * @property string|null $confirmBy
 * @property string|null $confirm_at
 * @property string|null $deleteBy
 * @property string|null $deleted_at
 * @property string|null $DocEntry
 * @property string|null $ObjType
 * @property float $openQty
 * @property string|null $MaThiTruong
 * @property string|null $ErrorData
 * @property int $isPushSAP
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt query()
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereBaseID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereConfirm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereConfirmAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereConfirmBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereDeleteBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereDeleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereDocEntry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereErrorData($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereIsPushSAP($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereLYDO($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereMaThiTruong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereObjType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereOpenQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereQuyCach($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereSPDich($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereSubItemCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereSubItemName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereTeam($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereText($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceipt whereUpdatedAt($value)
 */
	class notireceipt extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string|null $ProdType
 * @property string|null $FatherCode
 * @property string|null $ItemCode
 * @property string|null $ItemName
 * @property string|null $CongDoan
 * @property int|null $type
 * @property string|null $text
 * @property string|null $Quantity
 * @property string|null $QuyCach
 * @property string|null $LYDO
 * @property string|null $team
 * @property string|null $NextTeam
 * @property string|null $SubItemCode
 * @property string|null $SubItemName
 * @property float $CDay
 * @property float $CRong
 * @property float $CDai
 * @property int $confirm
 * @property int $confirmBy
 * @property string|null $confirm_at
 * @property int $deleted
 * @property int $deletedBy
 * @property string|null $deleted_at
 * @property string $openQty
 * @property string|null $MaThiTruong
 * @property string|null $ErrorData
 * @property int $isQCConfirmed
 * @property string|null $CreatedBy
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $version
 * @property int $isPushSAP
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN query()
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereCDai($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereCDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereCRong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereConfirm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereConfirmAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereConfirmBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereCongDoan($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereDeleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereDeletedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereErrorData($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereFatherCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereIsPushSAP($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereIsQCConfirmed($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereItemCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereItemName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereLYDO($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereMaThiTruong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereNextTeam($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereOpenQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereProdType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereQuyCach($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereSubItemCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereSubItemName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereTeam($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereText($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|notireceiptVCN whereVersion($value)
 */
	class notireceiptVCN extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $palletID
 * @property string $ItemCode
 * @property string $WhsCode
 * @property string $WhsCode2
 * @property string $BatchNum
 * @property string $Qty
 * @property int|null $Qty_T
 * @property string $CDai
 * @property string $CDay
 * @property string $CRong
 * @property string|null $CDay_Site
 * @property string|null $CRong_Site
 * @property string|null $CDai_Site
 * @property string|null $QuyCachSite
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $ItemName
 * @property-read \App\Models\Pallet $pallet
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details query()
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereBatchNum($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereCDai($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereCDaiSite($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereCDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereCDaySite($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereCRong($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereCRongSite($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereItemCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereItemName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details wherePalletID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereQtyT($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereQuyCachSite($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereWhsCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|pallet_details whereWhsCode2($value)
 */
	class pallet_details extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $PlanID
 * @property \App\Models\Pallet|null $pallet
 * @property string $size
 * @property string $Qty
 * @property string $Mass
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail query()
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail whereMass($value)
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail wherePallet($value)
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail wherePlanID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder|plandetail whereUpdatedAt($value)
 */
	class plandetail extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $PlanID
 * @property string $Code
 * @property string $Oven
 * @property string $Reason
 * @property string $Method
 * @property string|null $Mass
 * @property int|null $TotalPallet
 * @property string|null $PlanDate
 * @property int|null $Status
 * @property int|null $Checked
 * @property int|null $Review
 * @property int|null $Disabilities
 * @property string|null $CreateBy
 * @property int $Time
 * @property int|null $CheckedBy
 * @property int|null $RunBy
 * @property int|null $ReviewBy
 * @property int|null $CompletedBy
 * @property string|null $DateChecked
 * @property int|null $NoCheck
 * @property int|null $result
 * @property string|null $SoLan
 * @property string|null $CBL
 * @property string|null $DoThucTe
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $CT1
 * @property int|null $CT2
 * @property int|null $CT3
 * @property int|null $CT4
 * @property int|null $CT5
 * @property int|null $CT6
 * @property int|null $CT7
 * @property int|null $CT8
 * @property int|null $CT9
 * @property int|null $CT10
 * @property int|null $CT11
 * @property int|null $CT12
 * @property string|null $runDate
 * @property string|null $reviewDate
 * @property string|null $CompletedDate
 * @property string|null $plant
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\plandetail> $details
 * @property-read int|null $details_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\worker> $worker
 * @property-read int|null $worker_count
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings query()
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCBL($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT10($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT11($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT12($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT5($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT6($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT7($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT8($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCT9($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereChecked($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCheckedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCompletedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCompletedDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCreateBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereDateChecked($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereDisabilities($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereDoThucTe($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereMass($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereNoCheck($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereOven($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings wherePlanDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings wherePlanID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings wherePlant($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereResult($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereReview($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereReviewBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereReviewDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereRunBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereRunDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereSoLan($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereTotalPallet($value)
 * @method static \Illuminate\Database\Eloquent\Builder|planDryings whereUpdatedAt($value)
 */
	class planDryings extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $noti_ID
 * @property string $ItemCode
 * @property float $SLD
 * @property float $SLL
 * @method static \Illuminate\Database\Eloquent\Builder|stockItemWIP newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|stockItemWIP newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|stockItemWIP query()
 * @method static \Illuminate\Database\Eloquent\Builder|stockItemWIP whereItemCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|stockItemWIP whereNotiID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|stockItemWIP whereSLD($value)
 * @method static \Illuminate\Database\Eloquent\Builder|stockItemWIP whereSLL($value)
 */
	class stockItemWIP extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $PlanID
 * @property string $userID
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\planDryings $pallet
 * @method static \Illuminate\Database\Eloquent\Builder|worker newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|worker newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|worker query()
 * @method static \Illuminate\Database\Eloquent\Builder|worker whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|worker whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|worker wherePlanID($value)
 * @method static \Illuminate\Database\Eloquent\Builder|worker whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|worker whereUserID($value)
 */
	class worker extends \Eloquent {}
}

