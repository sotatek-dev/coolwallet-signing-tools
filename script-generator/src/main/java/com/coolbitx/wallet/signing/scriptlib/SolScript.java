package com.coolbitx.wallet.signing.scriptlib;
import com.coolbitx.wallet.signing.utils.HexUtil;
import com.coolbitx.wallet.signing.utils.ScriptArgumentComposer;
import com.coolbitx.wallet.signing.utils.ScriptAssembler;
import com.coolbitx.wallet.signing.utils.ScriptData;
import com.coolbitx.wallet.signing.utils.ScriptAssembler.HashType;
import com.coolbitx.wallet.signing.utils.ScriptAssembler.SignType;
import com.coolbitx.wallet.signing.utils.ScriptData.Buffer;

public class SolScript {
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
    public static void main(String[] args) {
        listAll();
    }

    public String script = "03000202C70700000001F5CAA01700CAA11700CAAC170002CAAC170003CAACC7000460CAACC7006410CAAC170074CAAC170075CAACC7007602CAAC170078DDFC970023DAACC7C0790C07D207CC05065052455353425554546F4E";

    public String scriptSmartContract = "03000202C70700000001F5CAA0C70005CAACC7000505CAACC7000A05CAACC7000F02CAACC7001160CAAC570071CAAC170091CAAC170092CAAC170093CAACC7009402CAAC170096CAACC7009704DC07C003534F4CD207C005534D415254D207CC05065052455353425554546F4E";

    public static void listAll() {
        System.out.println("Sol transfer: \n" + getTransferScript() + "\n");
        System.out.println("Sol Smart Contract: \n" + getSolSmartScript() + "\n");
        System.out.println("Sol transfer spl token: \n" + getTransferSplTokenScript() + "\n");

    }

    public static String getTransferScript() {
        ScriptArgumentComposer sac = new ScriptArgumentComposer();
        ScriptData fromAccount = sac.getArgument(32);
        ScriptData toAccount = sac.getArgument(32);
        ScriptData programId = sac.getArgument(32);
        ScriptData recentBlockHash = sac.getArgument(32);
        ScriptData dataLength = sac.getArgument(1);
        ScriptData programIdIndex = sac.getArgument(4);
        ScriptData data = sac.getArgumentAll();

        ScriptAssembler scriptAsb = new ScriptAssembler();
        String script = scriptAsb
                .setCoinType(0x01f5)
                .copyString("01")
                .copyString("00")
                .copyString("01")
                .copyString("03")
                .copyArgument(fromAccount)
                .copyArgument(toAccount)
                .copyArgument(programId)
                .copyArgument(recentBlockHash)
                .copyString("01")
                .copyString("02")
                .copyString("02")
                .copyString("0001")
                .copyArgument(dataLength)
                .copyArgument(programIdIndex)
                .copyArgument(data)

                .showMessage("SOL")
                .baseConvert(toAccount, Buffer.CACHE2, 0, ScriptAssembler.base58Charset,
                        ScriptAssembler.zeroInherit)
                .showAddress(ScriptData.getDataBufferAll(Buffer.CACHE2))
                .clearBuffer(Buffer.CACHE2)
                .baseConvert(data, Buffer.CACHE1, 8, ScriptAssembler.binaryCharset, ScriptAssembler.inLittleEndian)
                .showAmount(ScriptData.getDataBufferAll(Buffer.CACHE1), 9)
                .clearBuffer(Buffer.CACHE1)
                .showPressButton()
                .setHeader(HashType.NONE, SignType.EDDSA)
                .getScript();

        return script;
    }

    public static String getSolSmartScript() {
        ScriptArgumentComposer sac = new ScriptArgumentComposer();
        ScriptData keys = sac.getArgumentRightJustified(96);
        ScriptData recentBlockHash = sac.getArgumentRightJustified(32);
        ScriptData dataLength = sac.getArgument(1);
        ScriptData data = sac.getArgumentAll();

        ScriptAssembler scriptAsb = new ScriptAssembler();
        String script = scriptAsb
                .setCoinType(0x01f5)
                .copyString("01")
                .copyString("00")
                .copyString("01")
                .copyString("03")
                .copyArgument(keys)
                .copyArgument(recentBlockHash)
                .copyString("01")
                .copyString("02")
                .copyString("01")
                .copyString("01")
                .copyArgument(dataLength)
                .copyArgument(data)

                .showMessage("SOL")
                .showWrap("SMART", "")
                .showPressButton()
                .setHeader(HashType.NONE, SignType.EDDSA)
                .getScript();
        return script;
    }

    public static String getTransferSplTokenScript() {
        ScriptArgumentComposer sac = new ScriptArgumentComposer();
        ScriptData ownerAccount = sac.getArgument(32);
        ScriptData fromAssociateAccount = sac.getArgument(32);
        ScriptData toAssociateAccount = sac.getArgument(32);
        ScriptData programId = sac.getArgument(32);

        ScriptData recentBlockHash = sac.getArgumentRightJustified(32);
        ScriptData dataLength = sac.getArgument(1);
        ScriptData programIdIndex = sac.getArgument(1);
        ScriptData data = sac.getArgumentAll();

        ScriptAssembler scriptAsb = new ScriptAssembler();
        String script = scriptAsb
                .setCoinType(0x01f5)
                .copyString("01")
                .copyString("00")
                .copyString("01")
                .copyString("04")
                .copyArgument(ownerAccount)
                .copyArgument(fromAssociateAccount)
                .copyArgument(toAssociateAccount)
                .copyArgument(programId)
                .copyArgument(recentBlockHash)
                .copyString("01")
                .copyString("03")
                .copyString("03")
                .copyString("020100")
                .copyArgument(dataLength)
                .copyArgument(programIdIndex)
                .copyArgument(data)

                .showWrap("SOL", "SPL")
                .baseConvert(toAssociateAccount, Buffer.CACHE2, 0, ScriptAssembler.base58Charset,
                        ScriptAssembler.zeroInherit)
                .showAddress(ScriptData.getDataBufferAll(Buffer.CACHE2))
                .clearBuffer(Buffer.CACHE2)
                .baseConvert(data, Buffer.CACHE1, 8, ScriptAssembler.binaryCharset, ScriptAssembler.inLittleEndian)
                .showAmount(ScriptData.getDataBufferAll(Buffer.CACHE1), 9)
                .clearBuffer(Buffer.CACHE1)
                .showPressButton()
                .setHeader(HashType.NONE, SignType.EDDSA)
                .getScript();

        return script;
    }
}
