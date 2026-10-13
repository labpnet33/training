var e=e=>`<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="First match wins">
<rect x="10" y="10" width="300" height="34" rx="6" fill="#fecaca"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="12">[1] DENY 80/tcp from 198.51.100.0/24</text>
<rect x="10" y="50" width="300" height="34" rx="6" fill="#bbf7d0"/><text x="160" y="72" text-anchor="middle" class="svg-ink" font-size="12">[2] ALLOW 22/tcp from 10.99.0.0/24</text>
<rect x="10" y="90" width="300" height="34" rx="6" fill="#bbf7d0"/><text x="160" y="112" text-anchor="middle" class="svg-ink" font-size="12">[3] ALLOW 80/tcp from Anywhere</text>
<rect x="380" y="25" width="250" height="90" rx="10" fill="#ede9fe"/><text x="505" y="55" text-anchor="middle" class="svg-ink" font-size="13">Packet from 198.51.100.7</text><text x="505" y="75" text-anchor="middle" class="svg-ink" font-size="13">to port 80 hits [1] first</text><text x="505" y="97" text-anchor="middle" class="svg-muted" font-size="11">denied; [3] is never reached</text>
<line x1="310" y1="27" x2="380" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@nms03:~$ sudo ufw deny from 203.0.113.9
netadmin@nms03:~$ sudo ufw insert 1 deny from 198.51.100.0/24 to any port 80 proto tcp
netadmin@nms03:~$ sudo ufw status numbered</pre>
<pre class="out">Rule added
Rule inserted
Status: active

     To                         Action      From
     --                         ------      ----
<span class="hl">[ 1] 80/tcp                     DENY IN     198.51.100.0/24</span>
[ 2] 22/tcp                     ALLOW IN    10.99.0.0/24
[ 3] 514/udp                    ALLOW IN    10.99.0.0/24
[ 4] 80/tcp                     ALLOW IN    Anywhere
[ 5] Anywhere                   DENY IN     203.0.113.9</pre>`,n=`<pre class="code">netadmin@nms03:~$ sudo ufw delete 1</pre>
<pre class="out">Deleting:
 deny from 198.51.100.0/24 to any port 80 proto tcp
Rule deleted</pre>`,r=`<pre class="code">netadmin@nms03:~$ sudo ufw reject 25/tcp
netadmin@nms03:~$ sudo ufw allow ssh
netadmin@nms03:~$ sudo ufw limit 22/tcp
netadmin@nms03:~$ sudo ufw status numbered</pre>
<pre class="out">Rule added
Rule added
Rule added
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    10.99.0.0/24
[ 2] 514/udp                    ALLOW IN    10.99.0.0/24
[ 3] 80/tcp                     ALLOW IN    Anywhere
[ 4] Anywhere                   DENY IN     203.0.113.9
[ 5] 25/tcp                     REJECT IN   Anywhere
<span class="hl">[ 6] 22/tcp                     ALLOW IN    Anywhere</span>
[ 7] 22/tcp                     LIMIT IN    Anywhere</pre>`,i={id:`rule-order`,h:{en:`Rule order: first match wins`,hi:`Rule order: pehla match jeetta hai`},body:{en:`
<p>Like a router ACL, ufw reads its rules <b>from top to bottom and stops at the first rule that matches</b>. Rules below a matching rule are never looked at for that packet. So the order of the list matters as much as the content of each line. A broad deny placed above a specific allow hides the allow completely, and a broad allow placed above a deny makes the deny useless.</p>
`+e(`The packet stops at the first matching rule. Order is part of the policy.`)+`
<h3>Numbers, insert and delete</h3>
<p><code>ufw status numbered</code> shows each rule with its position in square brackets. Those numbers are how you point at a rule. New rules are normally added at the <b>bottom</b>. If a new rule must be checked first, use <code>insert N</code>, which puts the rule at position N and moves the others down:</p>
`+t+`
<p>The status shows the new rule at position 1, ahead of everything else, and the stray block for 203.0.113.9 at the end. (These addresses come from the ranges reserved for documentation, so they are safe to use in examples.) Notice that the order the rules were <b>typed</b> is not the order they are <b>checked</b>: you used <code>insert 1</code> after adding the other one.</p>
<p>To remove a rule, either repeat its words with <code>delete</code> in front, or give its number. The number form shows you the rule it is about to remove, which is a good habit:</p>
`+n+`
<div class="warn"><p><b>Numbers change.</b> After a delete or an insert, the numbers of the rules below move. Always run <code>ufw status numbered</code> again before the next delete. Deleting by number twice in a row without looking is how you remove the wrong rule.</p></div>

<h3>Deny, reject and limit</h3>
<table class="cmp"><tr><th>Action</th><th>What the client sees</th><th>Use it for</th></tr>
<tr><td><code>deny</code></td><td>Nothing. The packet is dropped silently and the client times out.</td><td>The normal choice for untrusted sources. It gives an attacker no information.</td></tr>
<tr><td><code>reject</code></td><td>An immediate error message ("refused").</td><td>Internal clients that should fail fast, for example a port you want users to stop trying.</td></tr>
<tr><td><code>limit</code></td><td>Allowed, but a source making too many new connections in a short time is blocked.</td><td>Slowing down password guessing against SSH.</td></tr></table>
<p>Try them together:</p>
`+r+`
<p>Read this list like an auditor. Rule 5 rejects port 25 (mail). Rule 7 is the limit rule for SSH. But look at rule 6, the highlighted one: <code>allow ssh</code> opened SSH to <b>Anywhere</b>, and it sits above the limit rule. Rule 1 still allows SSH from the management network, but rule 6 now also lets everyone else in. One convenient command quietly undid the careful design of the first rule. The fix is simple: <code>ufw delete 6</code> (after checking the number), and, if you want rate limiting only for management, write a long-form limit rule. This is why you read the whole list after every change.</p>

<div class="eg"><p><b>Worked example.</b> Rules: [1] allow 22/tcp from Anywhere, [2] deny 22/tcp from 198.51.100.0/24. Can 198.51.100.7 SSH in? Yes. Rule 1 matches first and allows it, so the deny is useless. Swap them: put the deny first with <code>insert 1 deny from 198.51.100.0/24 to any port 22 proto tcp</code>. Now 198.51.100.7 is denied and everyone else still reaches rule 2.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which rule wins, the most specific or the first?" In ufw and in ACLs the first match wins, not the most specific. Specific rules must be placed above general ones.</p></div>
<div class="scn"><h4>The deny that never fired</h4><p>A security alert asked for a hostile address to be blocked. The engineer ran <code>ufw deny from 203.0.113.9</code>, saw "Rule added", and closed the ticket. Weeks later logs showed that address still reaching the web server, because an earlier broad rule allowed port 80 from Anywhere and sat above the deny. The fix was <code>insert 1</code>.</p><p><b>Lesson:</b> a block rule must be above the allow it overrides, and you must test it.</p></div>
<div class="iv"><p class="q">"What is the difference between deny and reject?"</p><p>Deny drops silently, so the client waits and times out; it reveals nothing. Reject sends back an error immediately. I use deny on untrusted networks and reject on internal clients where a fast, clear failure is helpful.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First match wins; order is policy.</li>
<li><code>status numbered</code>, <code>insert N</code> and <code>delete N</code> let you control order. Numbers shift after changes.</li>
<li>deny is silent, reject answers, limit slows repeated connections.</li>
<li>Convenience commands such as <code>allow ssh</code> can open more than intended: always re-read the list.</li>
</ul></div>
`,hi:`
<p>Router ACL ki tarah ufw apne rules <b>upar se neeche padhta hai aur pehle match hone wale rule par ruk jaata hai</b>. Match hue rule ke neeche wale rules us packet ke liye dekhe hi nahi jaate. Isliye list ka order utna hi zaroori hai jitna har line ka content. Specific allow ke upar broad deny allow ko poori tarah chhupa deta hai, aur deny ke upar broad allow deny ko bekaar bana deta hai.</p>
`+e(`Packet pehle match hone wale rule par ruk jaata hai. Order policy ka hissa hai.`)+`
<h3>Numbers, insert aur delete</h3>
<p><code>ufw status numbered</code> har rule ko uski position ke saath square brackets mein dikhata hai. In numbers se aap rule ki taraf ishara karte ho. Naye rules aam taur par <b>neeche</b> jude jaate hain. Agar naya rule pehle check hona chahiye, to <code>insert N</code> use karo, jo rule ko position N par rakhta hai aur baaki ko neeche khiskata hai:</p>
`+t+`
<p>Status naya rule position 1 par dikhata hai, sab se pehle, aur 203.0.113.9 ka stray block aakhir mein. (Yeh addresses documentation ke liye reserved ranges se hain, isliye examples mein safe hain.) Dhyan do ki rules jis order mein <b>type</b> hue woh order nahi hai jisme woh <b>check</b> hote hain: aapne doosra rule jodne ke baad <code>insert 1</code> use kiya.</p>
<p>Rule hataane ke liye ya to uske shabd <code>delete</code> ke saath dohrao, ya uska number do. Number wala form dikhata hai ki kaunsa rule hatne wala hai, jo achhi aadat hai:</p>
`+n+`
<div class="warn"><p><b>Numbers badalte hain.</b> Delete ya insert ke baad neeche wale rules ke numbers khisak jaate hain. Agle delete se pehle hamesha <code>ufw status numbered</code> dobara chalao. Bina dekhe lagaatar do baar number se delete karna galat rule hatane ka tareeka hai.</p></div>

<h3>Deny, reject aur limit</h3>
<table class="cmp"><tr><th>Action</th><th>Client ko kya dikhta hai</th><th>Kab use karo</th></tr>
<tr><td><code>deny</code></td><td>Kuch nahi. Packet chupchaap drop hota hai aur client timeout hota hai.</td><td>Untrusted sources ke liye normal choice. Attacker ko koi jaankari nahi milti.</td></tr>
<tr><td><code>reject</code></td><td>Turant error message ("refused").</td><td>Internal clients jo jaldi fail hon, jaise woh port jise users try karna band karein.</td></tr>
<tr><td><code>limit</code></td><td>Allowed, par jo source kam samay mein bahut naye connections banaye woh block hota hai.</td><td>SSH par password guessing ko dheema karna.</td></tr></table>
<p>Teeno saath mein try karo:</p>
`+r+`
<p>Is list ko auditor ki tarah padho. Rule 5 port 25 (mail) reject karta hai. Rule 7 SSH ka limit rule hai. Par rule 6 dekho, highlighted wala: <code>allow ssh</code> ne SSH <b>Anywhere</b> ke liye khol diya, aur woh limit rule ke upar hai. Rule 1 ab bhi management network se SSH deta hai, par rule 6 ab baaki sabko bhi andar aane deta hai. Ek suvidhajanak command ne pehle rule ke dhyan se banaye design ko chupchaap undo kar diya. Fix aasaan hai: <code>ufw delete 6</code> (number check karke), aur agar rate limiting sirf management ke liye chahiye to lamba-form limit rule likho. Isiliye har badlav ke baad poori list padhte hain.</p>

<div class="eg"><p><b>Worked example.</b> Rules: [1] allow 22/tcp from Anywhere, [2] deny 22/tcp from 198.51.100.0/24. Kya 198.51.100.7 SSH kar sakta hai? Haan. Rule 1 pehle match hota hai aur allow karta hai, isliye deny bekaar hai. Unhe badlo: deny ko <code>insert 1 deny from 198.51.100.0/24 to any port 22 proto tcp</code> se pehle rakho. Ab 198.51.100.7 denied hai aur baaki sab rule 2 tak pahunchte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa rule jeetta hai, sabse specific ya pehla?" ufw aur ACLs mein pehla match jeetta hai, sabse specific nahi. Specific rules general se upar rakhne padte hain.</p></div>
<div class="scn"><h4>Woh deny jo kabhi chala nahi</h4><p>Security alert ne ek dushman address block karne ko kaha. Engineer ne <code>ufw deny from 203.0.113.9</code> chalaya, "Rule added" dekha aur ticket band kar diya. Hafton baad logs ne dikhaya ki woh address ab bhi web server tak pahunch raha tha, kyunki ek pehle ka broad rule Anywhere se port 80 allow karta tha aur deny ke upar tha. Fix <code>insert 1</code> tha.</p><p><b>Lesson:</b> block rule us allow ke upar hona chahiye jise woh override kare, aur use test karna chahiye.</p></div>
<div class="iv"><p class="q">"Deny aur reject mein kya farak hai?"</p><p>Deny chupchaap drop karta hai, isliye client intezaar karke timeout hota hai; kuch reveal nahi karta. Reject turant error wapas bhejta hai. Untrusted networks par deny, aur internal clients par reject use karta hoon jahan tez, saaf failure madadgar hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehla match jeetta hai; order policy hai.</li>
<li><code>status numbered</code>, <code>insert N</code> aur <code>delete N</code> se order control hota hai. Badlav ke baad numbers khisakte hain.</li>
<li>deny chupchaap hai, reject jawab deta hai, limit baar-baar connections ko dheema karta hai.</li>
<li><code>allow ssh</code> jaise suvidhajanak commands iraade se zyada khol sakte hain: hamesha list dobara padho.</li>
</ul></div>
`}};export{i as default};