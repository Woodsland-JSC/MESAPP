<?php

namespace App\Exceptions;

use Exception;

class CustomException extends Exception
{
    protected $customCode;

    public function __construct($message = "", $customCode = 20000)
    {
        parent::__construct($message);
        $this->customCode = $customCode;
    }

    public function getCustomCode()
    {
        return $this->customCode;
    }
}
