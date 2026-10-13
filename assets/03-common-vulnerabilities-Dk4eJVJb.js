var e={id:`vulns`,h:{en:`Common vulnerabilities, at defender level`,hi:`Common vulnerabilities, defender level par`},body:{en:`
<p>A threat needs a way in. That way in is a <b>vulnerability</b>: a door left unlocked, a window with a broken latch. SCOR blueprint item 1.2 asks you to compare the most common ones. You do not need to write attacks; you need to recognise the weakness, know why it is dangerous, spot its traces in logs, and name the fix.</p>

<h3>The one idea behind most of them: trusting input</h3>
<p>Almost every application vulnerability comes from one mistake: <b>the program treats data from an untrusted source as if it were instructions</b>. A form field, a URL, an API parameter, a file upload, even a header, all come from outside the <b>trust boundary</b>. When the program passes that data to a database, a shell, a file system or a web page without checking it, the attacker's data becomes the attacker's command.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Untrusted input crossing a trust boundary">
<rect x="10" y="70" width="120" height="50" rx="8" fill="#fed7aa"/><text x="70" y="100" text-anchor="middle" class="svg-ink" font-size="13">Untrusted input</text>
<line x1="170" y1="20" x2="170" y2="180" stroke="#64748b" stroke-dasharray="6 4"/><text x="175" y="195" class="svg-muted" font-size="12">trust boundary</text>
<rect x="200" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="260" y="92" text-anchor="middle" class="svg-ink" font-size="13">Validate</text><text x="260" y="110" text-anchor="middle" class="svg-ink" font-size="13">and encode</text>
<line x1="130" y1="95" x2="200" y2="95" stroke="#64748b"/>
<rect x="380" y="10" width="120" height="34" rx="8" fill="#bae6fd"/><text x="440" y="32" text-anchor="middle" class="svg-ink" font-size="12">Database: SQLi</text>
<rect x="380" y="56" width="120" height="34" rx="8" fill="#bae6fd"/><text x="440" y="78" text-anchor="middle" class="svg-ink" font-size="12">OS shell: cmd inj.</text>
<rect x="380" y="102" width="120" height="34" rx="8" fill="#bae6fd"/><text x="440" y="124" text-anchor="middle" class="svg-ink" font-size="12">Files: traversal</text>
<rect x="380" y="148" width="120" height="34" rx="8" fill="#bae6fd"/><text x="440" y="170" text-anchor="middle" class="svg-ink" font-size="12">Web page: XSS</text>
<line x1="320" y1="95" x2="380" y2="27" stroke="#64748b"/><line x1="320" y1="95" x2="380" y2="73" stroke="#64748b"/><line x1="320" y1="95" x2="380" y2="119" stroke="#64748b"/><line x1="320" y1="95" x2="380" y2="165" stroke="#64748b"/>
<text x="520" y="100" class="svg-accent" font-size="12">skip the check</text><text x="520" y="118" class="svg-accent" font-size="12">= injection</text>
</svg><p class="cap">Each "sink" (database, shell, file system, browser) has its own injection flaw when input is not validated and encoded.</p></div>

<h3>The vulnerabilities you must compare</h3>
<table class="cmp"><tr><th>Vulnerability</th><th>What goes wrong</th><th>Defender clue</th><th>Fix</th></tr>
<tr><td><b>Software bugs</b></td><td>Coding errors that let input reach places it should not; published as CVEs</td><td>Vendor advisory, IPS signature hits</td><td>Patch management, virtual patching with IPS</td></tr>
<tr><td><b>Weak or hard-coded passwords</b></td><td>Default or embedded credentials, often identical on every unit of a product</td><td>Logins from unusual sources, brute-force patterns</td><td>Change defaults, vaults, MFA, lockout</td></tr>
<tr><td><b>Missing encryption</b></td><td>Data sent or stored in clear text, or protected by weak ciphers and old protocols</td><td>Telnet, FTP, HTTP basic auth, SSLv3/TLS 1.0 seen in traffic</td><td>TLS 1.2/1.3, SSH, SNMPv3, encrypted storage</td></tr>
<tr><td><b>OS command injection</b></td><td>The application passes input into a system shell command</td><td>Web logs with shell separators and system command names in parameters</td><td>Never call a shell with input; use safe APIs and allow-lists</td></tr>
<tr><td><b>Buffer overflow</b></td><td>A program writes more data into memory than the buffer holds, overwriting nearby memory and possibly control data</td><td>Crashes, very long abnormal fields, IPS signatures</td><td>Bounds checking, memory-safe languages, ASLR and DEP, patching</td></tr>
<tr><td><b>Path traversal</b></td><td>File names from input escape the intended folder using parent-directory sequences</td><td>Requests containing repeated dot-dot-slash patterns, often URL-encoded</td><td>Canonicalise paths, allow-list file names, run with least privilege</td></tr>
<tr><td><b>XSS</b></td><td>Input echoed into a page without encoding runs as script in other users' browsers</td><td>Script tags or event handlers inside parameters</td><td>Output encoding, CSP, WAF</td></tr>
<tr><td><b>CSRF</b></td><td>A malicious page makes a logged-in victim's browser send a request the victim never intended (for example change email)</td><td>State-changing requests with a foreign Referer or Origin</td><td>Anti-CSRF tokens, SameSite cookies, re-authentication</td></tr>
</table>

<h3>Buffer overflow, explained with a glass of water</h3>
<p>Pour 500 ml into a 300 ml glass and the rest spills onto the table. In memory, the "table" might hold the address the program returns to when the function finishes. If an attacker controls what spills, he may redirect the program. That is why buffer overflows are so serious: they can turn a crash into <b>remote code execution</b>. Modern operating systems add <b>ASLR</b> (random memory layout) and <b>DEP/NX</b> (data areas cannot execute) to make this far harder, but the root fix is correct bounds checking and patching.</p>

<h3>XSS versus CSRF: the classic confusion</h3>
<p>Both involve a victim's browser and a website. The difference is <b>who is trusted</b>. In <b>XSS</b> the victim's browser trusts the website, and the attacker abuses that by getting his script served <i>by</i> the site. In <b>CSRF</b> the website trusts the victim's browser (it carries a valid session cookie), and the attacker abuses that by making the browser send a forged request <i>to</i> the site. XSS steals or acts inside the page; CSRF only fires a request.</p>

<div class="eg"><p><b>Worked example: triaging a web log.</b> The DMZ web server 10.0.2.10 logs 400 requests in two minutes from 198.51.100.44. Parameters contain repeated parent-directory sequences followed by the names of system configuration files. That is a <b>path traversal</b> probe. Response: confirm the application returns 404 or 403 (not file contents), add an IPS or WAF rule, block the source for a while, and verify the web service runs as an unprivileged account so even a successful traversal reads very little.</p></div>

<h3>Where the network team fits</h3>
<p>You will not fix application code, but you control three things that shrink the damage: <b>exposure</b> (only publish what must be public, and only from a DMZ), <b>detection</b> (IPS signatures and WAF rules catch known patterns and give "virtual patching" until the vendor fix arrives) and <b>encryption</b> (disable Telnet, HTTP management, SNMPv1/v2c, weak TLS on every device you own). OWASP Top 10 and CVSS scoring are covered in depth in the next module, sec-concepts.</p>

<div class="warn"><p><b>Common mistake.</b> Believing a WAF or IPS replaces fixing the bug. Signatures catch known patterns; a slightly different encoding can slip past. Virtual patching buys time; it is not the cure.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Missing encryption" includes <b>weak ciphers and old protocol versions</b>, not only plain text. And CSRF does not steal data by itself: it makes the victim perform an action. If an option says "attacker's script runs in the victim's browser", that is XSS.</p></div>

<div class="scn"><h4>The camera with a password nobody could change</h4><p>A facilities team installed IP cameras in a warehouse. A security audit found the cameras reachable from the corporate user VLAN and using a hard-coded service password published in an online forum. The vendor had no fix yet. The network team moved the cameras into their own segment, allowed only the video recorder to reach them through the firewall, and blocked everything else. When the firmware fix arrived months later, the exposure had already been near zero.</p><p><b>Lesson:</b> when you cannot fix the vulnerability, reduce who can reach it.</p></div>

<div class="iv"><p class="q">"What is the difference between XSS and CSRF?"</p><p>XSS injects script that runs in the victim's browser in the context of the vulnerable site, abusing the user's trust in the site; the fix is output encoding and CSP. CSRF tricks an authenticated browser into sending a state-changing request, abusing the site's trust in the browser's cookies; the fix is anti-CSRF tokens and SameSite cookies. A strong candidate also says both are mitigated partly by a WAF, but fixed in the application.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most application flaws come from treating untrusted input as instructions.</li>
<li>Injection flaws differ by sink: database (SQLi), shell (command injection), file system (path traversal), browser (XSS).</li>
<li>Buffer overflows can lead to code execution; ASLR, DEP and patching are the defences.</li>
<li>Missing encryption includes weak ciphers and outdated protocols.</li>
<li>Network teams reduce exposure, add detection and virtual patching, and enforce encryption.</li>
</ul></div>
`,hi:`
<p>Threat ko andar aane ka raasta chahiye. Woh raasta hai <b>vulnerability</b>: khula chhoda gaya darwaza, tooti kundi wali khidki. SCOR blueprint item 1.2 aapse sabse common vulnerabilities ko compare karne ko kehta hai. Aapko attacks likhne ki zaroorat nahi; aapko kamzori pehchaanni hai, samajhna hai ki woh khatarnaak kyun hai, logs mein uske nishaan dekhne hain, aur fix ka naam lena hai.</p>

<h3>Zyada tar ke peeche ek hi idea: input par bharosa karna</h3>
<p>Lagbhag har application vulnerability ek galti se aati hai: <b>program untrusted source ke data ko instructions ki tarah treat karta hai</b>. Form field, URL, API parameter, file upload, yahan tak ki header bhi, sab <b>trust boundary</b> ke bahar se aate hain. Jab program us data ko bina check kiye database, shell, file system ya web page ko de deta hai, to attacker ka data attacker ka command ban jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Untrusted input trust boundary paar karta hai">
<rect x="10" y="70" width="120" height="50" rx="8" fill="#fed7aa"/><text x="70" y="100" text-anchor="middle" class="svg-ink" font-size="13">Untrusted input</text>
<line x1="170" y1="20" x2="170" y2="180" stroke="#64748b" stroke-dasharray="6 4"/><text x="175" y="195" class="svg-muted" font-size="12">trust boundary</text>
<rect x="200" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="260" y="92" text-anchor="middle" class="svg-ink" font-size="13">Validate</text><text x="260" y="110" text-anchor="middle" class="svg-ink" font-size="13">aur encode</text>
<line x1="130" y1="95" x2="200" y2="95" stroke="#64748b"/>
<rect x="380" y="10" width="120" height="34" rx="8" fill="#bae6fd"/><text x="440" y="32" text-anchor="middle" class="svg-ink" font-size="12">Database: SQLi</text>
<rect x="380" y="56" width="120" height="34" rx="8" fill="#bae6fd"/><text x="440" y="78" text-anchor="middle" class="svg-ink" font-size="12">OS shell: cmd inj.</text>
<rect x="380" y="102" width="120" height="34" rx="8" fill="#bae6fd"/><text x="440" y="124" text-anchor="middle" class="svg-ink" font-size="12">Files: traversal</text>
<rect x="380" y="148" width="120" height="34" rx="8" fill="#bae6fd"/><text x="440" y="170" text-anchor="middle" class="svg-ink" font-size="12">Web page: XSS</text>
<line x1="320" y1="95" x2="380" y2="27" stroke="#64748b"/><line x1="320" y1="95" x2="380" y2="73" stroke="#64748b"/><line x1="320" y1="95" x2="380" y2="119" stroke="#64748b"/><line x1="320" y1="95" x2="380" y2="165" stroke="#64748b"/>
<text x="520" y="100" class="svg-accent" font-size="12">check chhoda</text><text x="520" y="118" class="svg-accent" font-size="12">= injection</text>
</svg><p class="cap">Har "sink" (database, shell, file system, browser) ki apni injection flaw hoti hai jab input validate aur encode nahi hota.</p></div>

<h3>Woh vulnerabilities jo aapko compare karni hain</h3>
<table class="cmp"><tr><th>Vulnerability</th><th>Kya galat hota hai</th><th>Defender clue</th><th>Fix</th></tr>
<tr><td><b>Software bugs</b></td><td>Coding errors jo input ko wahan pahunchne dete hain jahan nahi pahunchna chahiye; CVEs ke roop mein publish hote hain</td><td>Vendor advisory, IPS signature hits</td><td>Patch management, IPS se virtual patching</td></tr>
<tr><td><b>Weak ya hard-coded passwords</b></td><td>Default ya andar embed kiye credentials, aksar product ki har unit par ek jaise</td><td>Ajeeb sources se logins, brute-force patterns</td><td>Defaults badlo, vaults, MFA, lockout</td></tr>
<tr><td><b>Missing encryption</b></td><td>Data clear text mein bheja ya store kiya gaya, ya weak ciphers aur purane protocols se protected</td><td>Traffic mein Telnet, FTP, HTTP basic auth, SSLv3/TLS 1.0 dikhna</td><td>TLS 1.2/1.3, SSH, SNMPv3, encrypted storage</td></tr>
<tr><td><b>OS command injection</b></td><td>Application input ko system shell command mein de deti hai</td><td>Web logs jinke parameters mein shell separators aur system command names hain</td><td>Input ke saath kabhi shell call mat karo; safe APIs aur allow-lists use karo</td></tr>
<tr><td><b>Buffer overflow</b></td><td>Program buffer ki capacity se zyada data memory mein likhta hai, paas ki memory aur shayad control data ko overwrite karta hai</td><td>Crashes, bahut lambe abnormal fields, IPS signatures</td><td>Bounds checking, memory-safe languages, ASLR aur DEP, patching</td></tr>
<tr><td><b>Path traversal</b></td><td>Input se aaye file names parent-directory sequences use karke intended folder se bahar nikal jaate hain</td><td>Requests jinmein baar baar dot-dot-slash patterns hain, aksar URL-encoded</td><td>Paths canonicalise karo, file names allow-list karo, least privilege ke saath chalao</td></tr>
<tr><td><b>XSS</b></td><td>Bina encoding page mein wapas dikhaya gaya input doosre users ke browsers mein script ki tarah chalta hai</td><td>Parameters ke andar script tags ya event handlers</td><td>Output encoding, CSP, WAF</td></tr>
<tr><td><b>CSRF</b></td><td>Malicious page logged-in victim ke browser se aisi request bhijwata hai jo victim ne kabhi chahi hi nahi (jaise email badalna)</td><td>Foreign Referer ya Origin wali state-changing requests</td><td>Anti-CSRF tokens, SameSite cookies, re-authentication</td></tr>
</table>

<h3>Buffer overflow, paani ke glass se samjho</h3>
<p>300 ml ke glass mein 500 ml daalo to baaki table par gir jaata hai. Memory mein, woh "table" shayad woh address rakhti hai jahan function khatam hone par program wapas jaata hai. Agar attacker control kare ki kya girta hai, to woh program ko redirect kar sakta hai. Isiliye buffer overflows itne serious hain: woh crash ko <b>remote code execution</b> mein badal sakte hain. Modern operating systems ise bahut mushkil banane ke liye <b>ASLR</b> (random memory layout) aur <b>DEP/NX</b> (data areas execute nahi ho sakte) jodte hain, lekin asli fix sahi bounds checking aur patching hai.</p>

<h3>XSS versus CSRF: classic confusion</h3>
<p>Dono mein victim ka browser aur ek website hoti hai. Farak hai ki <b>kis par bharosa kiya ja raha hai</b>. <b>XSS</b> mein victim ka browser website par bharosa karta hai, aur attacker is bharose ka galat fayda uthata hai apni script ko site <i>se</i> serve karwa kar. <b>CSRF</b> mein website victim ke browser par bharosa karti hai (usmein valid session cookie hai), aur attacker is bharose ka galat fayda uthata hai browser se site <i>ko</i> nakli request bhijwa kar. XSS page ke andar churaata ya kaam karta hai; CSRF sirf ek request fire karta hai.</p>

<div class="eg"><p><b>Worked example: web log ka triage.</b> DMZ web server 10.0.2.10 do minute mein 198.51.100.44 se 400 requests log karta hai. Parameters mein baar baar parent-directory sequences hain aur uske baad system configuration files ke naam. Yeh <b>path traversal</b> probe hai. Response: confirm karo ki application 404 ya 403 return karti hai (file contents nahi), IPS ya WAF rule jodo, source ko kuch der ke liye block karo, aur verify karo ki web service unprivileged account se chalti hai taaki successful traversal bhi bahut kam padh sake.</p></div>

<h3>Network team kahan fit hoti hai</h3>
<p>Aap application code fix nahi karoge, lekin aap teen cheezein control karte ho jo nuksan ko chhota karti hain: <b>exposure</b> (sirf wahi publish karo jo public hona zaroori hai, aur sirf DMZ se), <b>detection</b> (IPS signatures aur WAF rules known patterns pakadte hain aur vendor fix aane tak "virtual patching" dete hain) aur <b>encryption</b> (apne har device par Telnet, HTTP management, SNMPv1/v2c, weak TLS band karo). OWASP Top 10 aur CVSS scoring agle module, sec-concepts, mein gehrai se cover hote hain.</p>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki WAF ya IPS bug fix karne ki jagah le leta hai. Signatures known patterns pakadti hain; thodi alag encoding bach kar nikal sakti hai. Virtual patching samay deti hai; ilaaj nahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Missing encryption" mein <b>weak ciphers aur purane protocol versions</b> bhi aate hain, sirf plain text nahi. Aur CSRF khud data nahi churaata: woh victim se ek action karwata hai. Agar option kahe "attacker ki script victim ke browser mein chalti hai", to woh XSS hai.</p></div>

<div class="scn"><h4>Woh camera jiska password koi badal nahi sakta tha</h4><p>Facilities team ne warehouse mein IP cameras lagaye. Security audit mein pata chala ki cameras corporate user VLAN se pahunch mein the aur ek hard-coded service password use kar rahe the jo ek online forum mein publish ho chuka tha. Vendor ke paas abhi fix nahi tha. Network team ne cameras ko unke apne segment mein daala, firewall se sirf video recorder ko unse baat karne di, aur baaki sab block kar diya. Jab mahino baad firmware fix aaya, tab tak exposure pehle hi lagbhag zero tha.</p><p><b>Seekh:</b> jab aap vulnerability fix nahi kar sakte, to kam karo ki kaun us tak pahunch sakta hai.</p></div>

<div class="iv"><p class="q">"XSS aur CSRF mein kya farak hai?"</p><p>XSS script inject karta hai jo vulnerable site ke context mein victim ke browser mein chalti hai, user ke site par bharose ka galat fayda uthaati hai; fix hai output encoding aur CSP. CSRF authenticated browser ko state-changing request bhejne mein phansata hai, site ke browser cookies par bharose ka galat fayda uthata hai; fix hai anti-CSRF tokens aur SameSite cookies. Strong candidate yeh bhi kehta hai ki dono WAF se kuch had tak kam hote hain, lekin fix application mein hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyada tar application flaws untrusted input ko instructions ki tarah treat karne se aate hain.</li>
<li>Injection flaws sink ke hisaab se alag hain: database (SQLi), shell (command injection), file system (path traversal), browser (XSS).</li>
<li>Buffer overflows code execution tak le ja sakte hain; ASLR, DEP aur patching defences hain.</li>
<li>Missing encryption mein weak ciphers aur outdated protocols bhi aate hain.</li>
<li>Network teams exposure kam karti hain, detection aur virtual patching jodti hain, aur encryption enforce karti hain.</li>
</ul></div>
`}};export{e as default};