var e=(e,t,n)=>`<rect x="10" y="`+e+`" width="400" height="22" rx="4" fill="`+t+`"/><text x="18" y="`+(e+15)+`" class="svg-ink" font-size="12">`+n+`</text>`,t=(e,t)=>`<text x="425" y="`+(e+15)+`" class="svg-muted" font-size="12">`+t+`</text>`,n=(n,r)=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="How a rejected command appears in the send_config_set text">`+e(8,`#e2e8f0`,`PUN-CORE-R1(config)#ntp server 10.99.0.50`)+e(34,`#fde68a`,`PUN-CORE-R1(config)#snmp-server communty NKRO RO`)+e(60,`#e2e8f0`,`                                ^`)+e(86,`#fecaca`,`% Invalid input detected at '^' marker.`)+e(112,`#fde68a`,`PUN-CORE-R1(config)#no no ip domain lookup`)+e(138,`#fecaca`,`% Invalid input detected at '^' marker.`)+t(8,n[0])+t(34,n[1])+t(86,n[2])+t(138,n[3])+`</svg><p class="cap">`+r+`</p></div>`,r=`<pre class="code">def rejected_lines(output):
    """The commands the router answered with a '%' error (the echo of the command comes just before it)."""
    bad, last = [], ""
    for ln in output.splitlines():
        if "(config)#" in ln:
            last = ln.split("(config)#", 1)[1]
        elif ln.startswith("%"):
            bad.append(last)
    return bad</pre>`,i=`<pre class="code">from nkmiko import ConnectHandler


def rejected_lines(output):
    bad, last = [], ""
    for ln in output.splitlines():
        if "(config)#" in ln:
            last = ln.split("(config)#", 1)[1]
        elif ln.startswith("%"):
            bad.append(last)
    return bad


conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
out = conn.send_config_set(["ntp server 10.99.0.50", "snmp-server communty NKRO RO", "no no ip domain lookup"])
print(out)
print("---")
print(rejected_lines(out))
conn.disconnect()</pre>`,a=`<pre class="out"><span class="hl">AUTO01$ python3 rawpush.py</span>
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
PUN-CORE-R1(config)#ntp server 10.99.0.50
PUN-CORE-R1(config)#<span class="hl">snmp-server communty NKRO RO</span>
                                ^
<span class="hl">% Invalid input detected at '^' marker.</span>
PUN-CORE-R1(config)#<span class="hl">no no ip domain lookup</span>
                       ^
<span class="hl">% Invalid input detected at '^' marker.</span>
PUN-CORE-R1(config)#end
PUN-CORE-R1#
---
<span class="hl">['snmp-server communty NKRO RO', 'no no ip domain lookup']</span></pre>`,o=`<pre class="code">    out = conn.send_config_set(todo)
    rejected = rejected_lines(out)
    after = clean(conn.send_command("show running-config"))
    missing = [ln for ln in todo if ln not in after]
    if rejected or missing:
        print("FAILED - rolling back")
        for ln in rejected:
            print("  the router rejected:", ln)</pre>`,s=`<pre class="out"><span class="hl">AUTO01$ python3 safepush.py R2 --baseline baseline-r2.cfg --apply</span>
R2: 4 of 4 baseline lines to add
  + no ip domain lookup
  + ntp server 10.99.0.50
  + snmp-server communty NKRO RO
  + logging host 10.99.0.51
<span class="hl">FAILED - rolling back
  the router rejected: snmp-server communty NKRO RO</span>
<span class="hl">config is identical to the backup</span></pre>`,c={id:`push-reject`,h:{en:`Pushing with send_config_set and catching rejected commands`,hi:`send_config_set se push aur rejected commands pakadna`},body:{en:`
<p><b>The idea of this chapter:</b> sending configuration is easy; hearing the router's complaints is the skill. A router never stops a script with an exception when it dislikes a line. It prints an error into the text it sends back, carries on with the next line, and the script sees success unless it reads that text.</p>

<h3>Analogy: dictation to a typist</h3>
<p>You dictate ten lines to a typist who sits in another room. If the typist cannot make sense of line 4, she writes "?? line 4" on her pad, types the other nine and slides the pad under the door. If you never read the pad, you believe all ten lines were typed correctly. <code>send_config_set</code> returns that pad.</p>

<h3>What send_config_set does</h3>
<p>From <b>auto-ssh</b> you know <code>conn.send_config_set(list_of_lines)</code>. It enters configuration mode (<code>configure terminal</code>), sends each line as if typed, leaves configuration mode (<code>end</code>) and returns the whole conversation as one string. Look at that string once with your own eyes. Write <code>rawpush.py</code>. It pushes three lines that cannot hurt: the NTP line R1 already has, and two lines the router will reject, so the configuration does not change.</p>
`+i+`
`+a+`
`+n([`accepted: silent`,`echo of the failed command`,`the router complaint`,`next failure, same shape`],`The text returned by send_config_set: an echoed command, a caret line, then a line that starts with a percent sign.`)+`

<h3>Anatomy of the text</h3>
<ul>
<li><b>The echo.</b> Every command comes back after the prompt <code>PUN-CORE-R1(config)#</code>. The prompt tells you the router is in global configuration mode.</li>
<li><b>The caret line.</b> A line with a <code>^</code> shows where the router stopped understanding the command.</li>
<li><b>The error line.</b> It starts with <code>%</code>. It is the router's complaint. Here it is <code>% Invalid input detected at '^' marker.</code></li>
<li><b>Accepted lines are silent.</b> <code>ntp server 10.99.0.50</code> has no message under it. Silence is the router's way of saying yes, and also the way a wrong-but-valid line passes (Chapter 7).</li>
</ul>
<p>The caret does not say which <b>command</b> failed, only the position inside it. The command is the echo line just above the caret. That is the whole idea of the helper:</p>
`+r+`
<ul>
<li>Walk through the text line by line.</li>
<li>When a line contains <code>(config)#</code>, split it once and keep what comes after: that is the command the router just echoed. Remember it in <code>last</code>.</li>
<li>When a line starts with <code>%</code>, the error belongs to the command remembered in <code>last</code>. Add it to the list <code>bad</code>.</li>
<li>Return the list. An empty list means the router complained about nothing.</li>
</ul>
<p>The printed list at the end of the output shows the result: both bad lines, in order. Note the second one: <code>no no ip domain lookup</code> is a line the tool itself would build by mistake (Chapter 8 returns to this trap). The router does not forgive it either.</p>

<h3>The router does not stop at the first error</h3>
<p>In the output the line after the first error was still processed. Real IOS behaves the same: a bad line does not abort the rest. So a push with one bad line out of six leaves <b>five</b> lines applied and one missing, a half-changed router. This is exactly why a failed push must be undone completely, not just reported.</p>

<h3>Lab 1, task 4: R2 with the typo</h3>
<p>The tool uses the helper right after the push:</p>
`+o+`
<p>The condition is <code>rejected or missing</code>: either the router said no (this chapter), or the line is absent when we read the config back (Chapter 7). Either one triggers the rollback. Run the real thing on R2:</p>
`+s+`
<p>The answer to the task is <code>snmp-server communty NKRO RO</code>. The other three lines were accepted, applied and then undone; the last line says the configuration is identical to the backup (Chapter 8).</p>
<p>Limit to know: the helper searches for <code>(config)#</code>. Inside an interface the prompt is <code>(config-if)#</code>, which would not match, so the tool is built for global configuration lines. A tool that pushes interface blocks needs a smarter prompt test.</p>

<div class="warn"><p><b>Common mistakes.</b> Ignoring the return value of <code>send_config_set</code>. Looking for the word "error" or "Invalid" instead of the leading <code>%</code>. Stopping at the first error and leaving the earlier lines in place. Assuming the line shown under the caret is the failing command.</p></div>
<div class="exam"><p><b>Exam trap.</b> Silence is not proof of success. A line can be accepted and still not end up as you wrote it. Read-back (Chapter 7) is the second, independent check.</p></div>

<div class="scn"><h4>Forty "successful" pushes</h4><p>A weekend job pushed an SNMP line to forty routers and logged "done" for each one. Monday's monitoring had no SNMP data from any of them. The line had a typo and every router answered with a percent error, which the job never read. The job only checked that the SSH session did not crash.</p><p><b>Lesson:</b> the router's refusal is data. Read it, name the line, and treat it as a failed push.</p></div>

<div class="iv"><p class="q">"How does your script know a command was rejected?"</p><p>I read the text returned by the configuration push. The router echoes each command after its prompt and prints a line that starts with <code>%</code> under a command it refuses. I remember the last echoed command and, whenever I see a percent line, record that command as rejected. I also read the config back, because the router can accept a line and still not store it as I wrote it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_config_set</code> returns the full transcript; a router error is a line that starts with <code>%</code>.</li>
<li>The failing command is the echo just above the caret line; <code>rejected_lines()</code> tracks it.</li>
<li>A router keeps going after a bad line, so a failed push leaves a half-applied change.</li>
<li>Silence means accepted, which is not the same as correct.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> configuration bhejna aasaan hai; router ki shikayat sun-na asli hunar hai. Router ko koi line pasand na aaye to woh script ko exception se nahi rokta. Woh wapas bheje text mein error print karta hai, agli line par chala jaata hai, aur script ko success dikhta hai jab tak woh text padhe nahi.</p>

<h3>Analogy: typist ko dictation</h3>
<p>Aap doosre kamre mein baithi typist ko das lines dictate karte ho. Typist ko line 4 samajh nahi aaye to woh apne pad par "?? line 4" likhti hai, baaki nau type karti hai aur pad darwaze ke neeche se sarka deti hai. Pad na padho to aap maan lete ho ki das lines sahi type hui. <code>send_config_set</code> wahi pad return karta hai.</p>

<h3>send_config_set kya karta hai</h3>
<p><b>auto-ssh</b> se aap <code>conn.send_config_set(list_of_lines)</code> jaante ho. Woh configuration mode mein jaata hai (<code>configure terminal</code>), har line aise bhejta hai jaise type ki ho, configuration mode se nikalta hai (<code>end</code>) aur poori baatcheet ek string ki tarah return karta hai. Us string ko ek baar apni aankhon se dekho. <code>rawpush.py</code> likho. Yeh teen lines push karta hai jo nuksaan nahi karti: NTP line jo R1 ke paas pehle se hai, aur do lines jo router reject karega, isliye configuration nahi badalti.</p>
`+i+`
`+a+`
`+n([`accept: chup`,`fail hue command ka echo`,`router ki shikayat`,`agla failure, same shape`],`send_config_set ka lautaya text: ek echoed command, caret line, phir percent sign se shuru hone wali line.`)+`

<h3>Text ki banaavat</h3>
<ul>
<li><b>Echo.</b> Har command prompt <code>PUN-CORE-R1(config)#</code> ke baad wapas aata hai. Prompt batata hai ki router global configuration mode mein hai.</li>
<li><b>Caret line.</b> <code>^</code> wali line dikhati hai ki router command ko kahan samajhna band kar gaya.</li>
<li><b>Error line.</b> Yeh <code>%</code> se shuru hoti hai. Yeh router ki shikayat hai. Yahan <code>% Invalid input detected at '^' marker.</code> hai.</li>
<li><b>Accept hui lines chup hoti hain.</b> <code>ntp server 10.99.0.50</code> ke neeche koi message nahi. Chuppi router ka "haan" hai, aur galat-par-valid line ke nikal jaane ka tareeka bhi (Chapter 7).</li>
</ul>
<p>Caret yeh nahi batata ki kaun sa <b>command</b> fail hua, sirf uske andar ki position batata hai. Command caret ke theek upar wali echo line hai. Helper ka poora idea yahi hai:</p>
`+r+`
<ul>
<li>Text ko line-by-line chalo.</li>
<li>Line mein <code>(config)#</code> ho to use ek baar split karo aur uske baad ka hissa rakho: yeh woh command hai jo router ne abhi echo kiya. Use <code>last</code> mein yaad rakho.</li>
<li>Line <code>%</code> se shuru ho to error <code>last</code> mein yaad command ka hai. Use list <code>bad</code> mein jodo.</li>
<li>List return karo. Khaali list matlab router ne kisi cheez ki shikayat nahi ki.</li>
</ul>
<p>Output ke ant mein print hui list result dikhati hai: dono bad lines, order mein. Doosri dekho: <code>no no ip domain lookup</code> aisi line hai jo tool khud galti se bana sakta hai (Chapter 8 is jaal par wapas aata hai). Router ise bhi maaf nahi karta.</p>

<h3>Router pehli error par nahi rukta</h3>
<p>Output mein pehli error ke baad wali line phir bhi process hui. Asli IOS bhi aisa hi karta hai: ek bad line baaki ko abort nahi karti. To chhe mein se ek bad line wala push <b>paanch</b> lines applied aur ek missing chhodta hai, yaani aadha badla hua router. Isi liye failed push ko sirf report nahi, poora undo karna padta hai.</p>

<h3>Lab 1, task 4: typo wala R2</h3>
<p>Tool push ke turant baad helper use karta hai:</p>
`+o+`
<p>Condition <code>rejected or missing</code> hai: ya to router ne mana kiya (yeh chapter), ya config wapas padhne par line gayab hai (Chapter 7). Dono mein se koi bhi rollback chalata hai. R2 par asli cheez chalao:</p>
`+s+`
<p>Task ka jawab <code>snmp-server communty NKRO RO</code> hai. Baaki teen lines accept hui, apply hui aur phir undo hui; aakhri line kehti hai ki configuration backup jaisi hi hai (Chapter 8).</p>
<p>Jaanne wali seema: helper <code>(config)#</code> dhoondhta hai. Interface ke andar prompt <code>(config-if)#</code> hota hai, jo match nahi karega, isliye tool global configuration lines ke liye bana hai. Jo tool interface blocks push kare use smarter prompt test chahiye.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>send_config_set</code> ki return value ignore karna. "error" ya "Invalid" shabd dhoondhna, jabki asli nishaan shuru ka <code>%</code> hai. Pehli error par ruk jaana aur pehle ki lines wahin chhod dena. Yeh maan lena ki caret ke neeche dikhi line hi fail hua command hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Chuppi success ka saboot nahi. Line accept hokar bhi waise store nahi hoti jaise aapne likhi. Read-back (Chapter 7) doosra, swatantra check hai.</p></div>

<div class="scn"><h4>Chalis "successful" pushes</h4><p>Weekend job ne chalis routers par ek SNMP line push ki aur har ek ke liye "done" log kiya. Monday ki monitoring mein kisi bhi router se SNMP data nahi tha. Line mein typo thi aur har router ne percent error se jawab diya, jo job ne kabhi padha nahi. Job sirf yeh dekhti thi ki SSH session crash na ho.</p><p><b>Lesson:</b> router ka inkaar data hai. Use padho, line ka naam lo, aur use failed push maano.</p></div>

<div class="iv"><p class="q">"Aapki script ko kaise pata chalta hai ki command reject hua?"</p><p>Main configuration push ka lautaya text padhta hoon. Router har command prompt ke baad echo karta hai aur jo command woh mana karta hai uske neeche <code>%</code> se shuru hone wali line print karta hai. Main aakhri echoed command yaad rakhta hoon aur jab bhi percent line dikhti hai us command ko rejected record karta hoon. Config wapas bhi padhta hoon, kyunki router line accept karke bhi use waise store nahi kar sakta jaise maine likhi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_config_set</code> poora transcript return karta hai; router error <code>%</code> se shuru hone wali line hai.</li>
<li>Fail hua command caret line ke theek upar ki echo hai; <code>rejected_lines()</code> use track karta hai.</li>
<li>Router bad line ke baad bhi chalta rehta hai, isliye failed push aadha-applied change chhodta hai.</li>
<li>Chuppi matlab accepted, jo correct hone ke barabar nahi hai.</li>
</ul></div>
`}};export{c as default};