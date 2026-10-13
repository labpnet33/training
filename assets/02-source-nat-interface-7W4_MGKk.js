var e={id:`source-nat-interface`,h:{en:`Source NAT with the interface address (PAT)`,hi:`Interface address se source NAT (PAT)`},body:{en:`<p><b>Analogy.</b> A hundred employees phone out through one company number. The switchboard writes each call on a slip with a unique line number so it can send the answer back to the right desk. The company number is the <b>interface address</b>; the unique line number is the <b>port</b>. This is <b>PAT</b>, port address translation.</p>
<h3>How interface source NAT works</h3>
<p>Interface NAT replaces the private source address with the address of the <b>egress interface</b> and picks a new source port for each session. Many hosts share one public address, and the session table remembers which port belongs to whom. It needs no pool, no proxy-ARP and no extra public addresses, which is why it is the default choice for office Internet access.</p>
<p>The configuration has three parts: <b>from</b> (where the traffic comes from), <b>to</b> (where it goes) and one or more <b>rules</b>.</p>
<pre class="code">set security nat source rule-set TRUST-TO-UNTRUST from zone trust
set security nat source rule-set TRUST-TO-UNTRUST to zone untrust
set security nat source rule-set TRUST-TO-UNTRUST rule R1 match source-address 192.168.10.0/24
set security nat source rule-set TRUST-TO-UNTRUST rule R1 then source-nat interface
commit</pre>
<pre class="out">user@BRANCH-SRX&gt; show security flow session
Session ID: 9467, Policy name: ALLOW-ALL/4, Timeout: 3600, Valid
  In: 192.168.10.10/51514 --&gt; 192.0.2.10/80;tcp, ... If: ge-0/0/1.0, ...
  Out: 192.0.2.10/80 --&gt; <span class="hl">203.0.113.2/60001</span>;tcp, ... If: ge-0/0/0.0, ...

user@BRANCH-SRX&gt; show security nat source rule all
source NAT rule: R1                        Rule-set: TRUST-TO-UNTRUST
    Action                   : interface
    Translation hits         : <span class="hl">2</span></pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Many private hosts share the interface address"><rect x="20" y="15" width="170" height="38" rx="8" fill="#bbf7d0"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="12">192.168.10.10:51514</text><rect x="20" y="80" width="170" height="38" rx="8" fill="#bbf7d0"/><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="12">192.168.10.11:51514</text><rect x="260" y="40" width="120" height="55" rx="8" fill="#fed7aa"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">SRX PAT</text><rect x="450" y="15" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2:60001</text><rect x="450" y="80" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="105" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2:60002</text><path d="M190 34L260 60M190 99L260 78M380 60L450 34M380 78L450 99" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Same address, different ports.</p></div>
<div class="eg"><p><b>Worked example.</b> The ISP has no route to 192.168.10.0/24, so packets from PC1 reach the Internet but replies cannot return. After interface NAT the replies go to 203.0.113.2 (the SRX), where the session table translates them back and forwards them to PC1.</p></div>
<div class="warn"><p><b>Common mistake.</b> Getting from-zone and to-zone reversed (trust and untrust swapped). The rule never matches, no packet is translated and the ISP drops the replies. Another trap: forgetting that old sessions made before the rule was committed are not translated; clear them.</p></div>
<div class="exam"><p><b>Exam trap.</b> Source NAT rule sets are written <i>from</i> the ingress zone <i>to</i> the egress zone. Interface NAT uses the egress interface address, so a rule needs no pool.</p></div>
<div class="scn"><h4>Browsing worked for the router, not for staff</h4><p>The branch router could ping the Internet but staff could not browse. The policy was right; the NAT rule-set was written "from untrust to trust". Swapping the zones made the translation hit counter move and browsing started.</p><p><b>Lesson:</b> read the direction of a NAT rule-set like a sentence: from where, to where.</p></div>
<div class="iv"><p class="q">"How do you give an office Internet access with one public IP?"</p><p>Source NAT with the interface address, from the trust zone to the untrust zone, plus a permit policy. I verify with the session table and the NAT rule hit count.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Interface NAT = PAT on the egress interface address.</li><li>Rule-sets are from zone and to zone.</li><li>Check translation hits and the Out line of the session.</li></ul></div>`,hi:`<p><b>Analogy.</b> Sau employees ek hi company number se bahar phone karte hain. Switchboard har call ko unique line number ki parchi par likhta hai taaki jawab sahi desk par bhej sake. Company number <b>interface address</b> hai; unique line number <b>port</b> hai. Yahi <b>PAT</b> hai, port address translation.</p>
<h3>Interface source NAT kaise kaam karta hai</h3>
<p>Interface NAT private source address ko <b>egress interface</b> ke address se badalta hai aur har session ke liye naya source port chunta hai. Kai hosts ek public address share karte hain, aur session table yaad rakhti hai ki kaunsa port kiska hai. Ise pool, proxy-ARP ya extra public addresses nahi chahiye, isliye office Internet access ke liye yahi default choice hai.</p>
<p>Configuration ke teen hisse hain: <b>from</b> (traffic kahan se aata hai), <b>to</b> (kahan jata hai) aur ek ya zyada <b>rules</b>.</p>
<pre class="code">set security nat source rule-set TRUST-TO-UNTRUST from zone trust
set security nat source rule-set TRUST-TO-UNTRUST to zone untrust
set security nat source rule-set TRUST-TO-UNTRUST rule R1 match source-address 192.168.10.0/24
set security nat source rule-set TRUST-TO-UNTRUST rule R1 then source-nat interface
commit</pre>
<pre class="out">user@BRANCH-SRX&gt; show security flow session
Session ID: 9467, Policy name: ALLOW-ALL/4, Timeout: 3600, Valid
  In: 192.168.10.10/51514 --&gt; 192.0.2.10/80;tcp, ... If: ge-0/0/1.0, ...
  Out: 192.0.2.10/80 --&gt; <span class="hl">203.0.113.2/60001</span>;tcp, ... If: ge-0/0/0.0, ...

user@BRANCH-SRX&gt; show security nat source rule all
source NAT rule: R1                        Rule-set: TRUST-TO-UNTRUST
    Action                   : interface
    Translation hits         : <span class="hl">2</span></pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Kai private hosts interface address share karte hain"><rect x="20" y="15" width="170" height="38" rx="8" fill="#bbf7d0"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="12">192.168.10.10:51514</text><rect x="20" y="80" width="170" height="38" rx="8" fill="#bbf7d0"/><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="12">192.168.10.11:51514</text><rect x="260" y="40" width="120" height="55" rx="8" fill="#fed7aa"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">SRX PAT</text><rect x="450" y="15" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2:60001</text><rect x="450" y="80" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="105" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2:60002</text><path d="M190 34L260 60M190 99L260 78M380 60L450 34M380 78L450 99" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Same address, alag ports.</p></div>
<div class="eg"><p><b>Worked example.</b> ISP ke paas 192.168.10.0/24 ka route nahi hai, isliye PC1 ke packets Internet tak pahunchte hain lekin replies wapas nahi aa sakte. Interface NAT ke baad replies 203.0.113.2 (SRX) par jaate hain, jahan session table unhe wapas translate karke PC1 ko forward karti hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> from-zone aur to-zone ulte likh dena (trust aur untrust swap). Rule kabhi match nahi hota, koi packet translate nahi hota aur ISP replies drop kar deta hai. Ek aur jaal: rule commit hone se pehle bane purane sessions translate nahi hote; unhe clear karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Source NAT rule sets ingress zone <i>se</i> egress zone <i>tak</i> likhe jaate hain. Interface NAT egress interface address use karta hai, isliye rule ko pool nahi chahiye.</p></div>
<div class="scn"><h4>Browsing router ke liye chali, staff ke liye nahi</h4><p>Branch router Internet ping kar sakta tha lekin staff browse nahi kar paya. Policy sahi thi; NAT rule-set "from untrust to trust" likha tha. Zones swap karte hi translation hit counter chala aur browsing shuru ho gayi.</p><p><b>Lesson:</b> NAT rule-set ki direction ko vaakya ki tarah padho: kahan se, kahan tak.</p></div>
<div class="iv"><p class="q">"Ek public IP se office ko Internet access kaise doge?"</p><p>trust zone se untrust zone tak interface address se source NAT, aur ek permit policy. Session table aur NAT rule hit count se verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Interface NAT = egress interface address par PAT.</li><li>Rule-sets from zone aur to zone ke hote hain.</li><li>Translation hits aur session ki Out line check karo.</li></ul></div>`}};export{e as default};