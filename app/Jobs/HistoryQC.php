<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Http\Controllers\sap\ConnectController;
class HistoryQC implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    protected $type;
    protected $Code ; 
    protected $ItemCode ;
    protected $Qty ;
    protected $WhsCode;
    protected $openQty ;
    protected $LLSX ;
    protected $TO ;
    protected $LL ;
    protected $HXL ;
    protected $source ;
    protected $ItemHC;
    protected $cmtQC ;
    protected $TCV ;
    public function __construct(  $type, $Code ,$ItemCode ,$Qty ,$WhsCode,$openQty,$LLSX ,$TO ,$LL ,$HXL ,$source ,$ItemHC,$cmtQC , $TCV ,)
    {
        $this->type= $type;
        $this->Code = $Code ;
        $this->ItemCode = $ItemCode ;
        $this->Qty  = $Qty ;
        $this->WhsCode  = $WhsCode;
        $this->openQty  = $openQty ;
        $this->LLSX   = $LLSX ;
        $this->TO = $TO ;
        $this->LL = $LL ;
        $this->HXL = $HXL ;
        $this->source = $source ;
        $this->ItemHC = $ItemHC;
        $this->cmtQC = $cmtQC;
        $this->TCV = $TCV;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //check nếu là updateorcreate thì log lại
        $conDB = (new ConnectController)->connect_sap();
        $query = 'call "UF_UpdateOrCreateLogQC"(?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            $this->fail('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [  $this->type,
                                    $this->Code ,
                                    $this->ItemCode ,
                                    $this->Qty ,
                                    $this->WhsCode,
                                    $this->openQty ,
                                    $this->LLSX ,
                                    $this->TO ,
                                    $this->LL ,
                                    $this->HXL ,
                                    $this->source ,
                                    $this->ItemHC,
                                    $this->cmtQC,
                                    $this->TCV ])
            ) {
            $this->fail('Error executing SQL statement: ' . odbc_errormsg($conDB));
          //  throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        odbc_close($conDB);
    }
}
