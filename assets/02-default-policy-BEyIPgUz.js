var e=e=>`<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Default policy">
<rect x="10" y="30" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="65" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text>
<rect x="170" y="30" width="160" height="60" rx="8" fill="#fed7aa"/><text x="250" y="55" text-anchor="middle" class="svg-ink" font-size="13">Match a rule?</text><text x="250" y="73" text-anchor="middle" class="svg-muted" font-size="11">top to bottom</text>
<rect x="380" y="10" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="440" y="35" text-anchor="middle" class="svg-ink" font-size="12">Yes: act on it</text>
<rect x="380" y="70" width="250" height="40" rx="8" fill="#fecaca"/><text x="505" y="95" text-anchor="middle" class="svg-ink" font-size="12">No: default policy (deny)</text>
<line x1="130" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="330" y1="50" x2="380" y2="30" stroke="#64748b" stroke-width="2"/><line x1="330" y1="70" x2="380" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@nms03:~$ sudo ufw default deny incoming
netadmin@nms03:~$ sudo ufw allow from 10.99.0.0/24 to any port 22 proto tcp
netadmin@nms03:~$ sudo ufw allow from 10.99.0.0/24 to any port 514 proto udp
netadmin@nms03:~$ sudo ufw allow 80/tcp
netadmin@nms03:~$ sudo ufw status</pre>
<pre class="out">Default incoming policy changed to 'deny'
(be sure to update your rules accordingly)
Rule added
Rule added
Rule added
<span class="hl">Status: inactive</span></pre>`,n=`<pre class="code">netadmin@nms03:~$ sudo ufw status verbose</pre>
<pre class="out">Status: active
<span class="hl">Logging: on (low)</span>
<span class="hl">Default: deny (incoming), allow (outgoing), disabled (routed)</span>
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    10.99.0.0/24
514/udp                    ALLOW IN    10.99.0.0/24
80/tcp                     ALLOW IN    Anywhere</pre>`,r={id:`default-policy`,h:{en:`Default policy: deny first, then allow`,hi:`Default policy: pehle deny, phir allow`},body:{en:`
<p>Every firewall answers one question for every packet: <i>what if no rule matches?</i> The answer is the <b>default policy</b>. There are two philosophies. <b>Default allow</b> lets everything in and you list what to block, which means you must know every bad thing in advance. <b>Default deny</b> blocks everything and you list only what is needed. Security teams choose default deny, because forgetting a rule then fails safe: a service stops working and someone complains, instead of a hole staying open quietly. This is called <b>least privilege</b>.</p>
`+e(`No rule matched? The default policy decides.`)+`
<h3>Setting the policy and adding rules</h3>
<p>The command <code>ufw default deny incoming</code> says: for traffic <b>coming in</b> to this server that matches no rule, deny. There is also a default for outgoing traffic. For a server the usual pair is <b>deny incoming, allow outgoing</b>, so the server can still fetch updates and send logs, while strangers cannot connect to it. Now build the plan from chapter 1, with the firewall still off:</p>
`+t+`
<p>Look at the last line. The rules were accepted, each with <code>Rule added</code>, but the status is still <b>inactive</b>. In ufw you can prepare a complete rule set <b>before</b> switching the firewall on, and nothing changes for users until you enable it. That separation is a safety feature: you can check your work first. Chapter 5 shows the enabling step. After it, the verbose status looks like this:</p>
`+n+`
<h3>Reading the verbose status</h3>
<dl class="terms">
<dt>Status: active</dt><dd>The firewall is enforcing rules now.</dd>
<dt>Logging: on (low)</dt><dd>Blocked packets are written to a log. Chapter 6 explains how to read it.</dd>
<dt>Default: deny (incoming), allow (outgoing), disabled (routed)</dt><dd>Three policies. <i>Incoming</i> is traffic to this server. <i>Outgoing</i> is traffic from it. <i>Routed</i> is traffic that merely passes through the server; this server is not a router, so it is disabled.</dd>
<dt>New profiles: skip</dt><dd>Application profiles installed later are not opened automatically. Good: nothing opens without your decision.</dd>
</dl>
<p>Then comes the rule table. <b>To</b> is the destination on this server (port and protocol), <b>Action</b> is what is done (<code>ALLOW IN</code> means allow incoming), and <b>From</b> is the source: a network such as 10.99.0.0/24 or <code>Anywhere</code>. Read row 1 as a sentence: "allow incoming TCP port 22 from 10.99.0.0/24". If you can say each row as a sentence, you understand the firewall.</p>

<div class="eg"><p><b>Worked example.</b> A packet from 10.20.0.10 arrives for TCP port 22. Rule 1 allows port 22 only from 10.99.0.0/24: no match, because the source is wrong. Rule 2 is UDP 514: no match. Rule 3 is TCP 80: no match. No rule matched, so the default policy decides: deny incoming. The packet is dropped. The same packet for TCP port 80 matches rule 3 and is allowed.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Setting a deny default and then enabling without an SSH rule (chapter 5 explains the lockout); forgetting that ufw prints "Rule added" even for a rule that is not what you meant; assuming outgoing traffic is filtered too. With the usual policy it is not.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default deny is applied to packets matching no rule. It is not a rule in the list, so it never appears in <code>ufw status numbered</code>; you find it in <code>ufw status verbose</code>.</p></div>
<div class="scn"><h4>Fail safe, not fail open</h4><p>A team forgot to add a rule for a new internal API on port 8443. With default deny, the first test failed within minutes and the owner opened exactly that port from exactly one network. In another datacentre the default had been allow; a similar forgotten rule left a database port open to the whole campus for months.</p><p><b>Lesson:</b> choose the default that makes mistakes visible.</p></div>
<div class="iv"><p class="q">"What default policy would you set on a server and why?"</p><p>Deny incoming, allow outgoing. Incoming is where attacks arrive, so I allow only needed services from needed networks. Outgoing stays open for updates and logging, and I can tighten it later for sensitive servers. A missing rule then fails safe.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default policy handles packets that match no rule; choose deny for incoming.</li>
<li>Rules can be added while the firewall is inactive; they apply when you enable it.</li>
<li><code>ufw status verbose</code> shows logging, the defaults and the rule table.</li>
<li>Say each rule as a sentence to check it.</li>
</ul></div>
`,hi:`
<p>Har firewall har packet ke liye ek sawaal ka jawab deta hai: <i>agar koi rule match na ho to?</i> Uska jawab <b>default policy</b> hai. Do philosophies hain. <b>Default allow</b> sab andar aane deta hai aur aap block karne wali cheezein list karte ho, yaani har buri cheez pehle se jaanni padegi. <b>Default deny</b> sab block karta hai aur aap sirf zaroori cheezein list karte ho. Security teams default deny chunti hain, kyunki rule bhoolne par yeh safe fail hota hai: service band hoti hai aur koi shikayat karta hai, bajaye iske ki hole chupchaap khula rahe. Ise <b>least privilege</b> kehte hain.</p>
`+e(`Koi rule match nahi hua? Default policy tay karti hai.`)+`
<h3>Policy set karna aur rules jodna</h3>
<p>Command <code>ufw default deny incoming</code> kehta hai: is server <b>ki taraf aane wale</b> traffic jo kisi rule se match na ho, deny karo. Outgoing traffic ka bhi default hota hai. Server ke liye aam jodi <b>deny incoming, allow outgoing</b> hai, taaki server updates la sake aur logs bhej sake, par ajnabi usse connect na kar sakein. Ab chapter 1 ka plan banao, firewall abhi band hai:</p>
`+t+`
<p>Aakhri line dekho. Rules accept hue, har ek <code>Rule added</code> ke saath, par status ab bhi <b>inactive</b> hai. ufw mein aap firewall on karne se <b>pehle</b> poora rule set taiyar kar sakte ho, aur enable karne tak users ke liye kuch nahi badalta. Yeh separation ek safety feature hai: pehle apna kaam check karo. Enable karne ka step chapter 5 mein hai. Uske baad verbose status aisa dikhta hai:</p>
`+n+`
<h3>Verbose status padhna</h3>
<dl class="terms">
<dt>Status: active</dt><dd>Firewall ab rules lagu kar raha hai.</dd>
<dt>Logging: on (low)</dt><dd>Block hue packets log mein likhe jaate hain. Chapter 6 batata hai ise kaise padhein.</dd>
<dt>Default: deny (incoming), allow (outgoing), disabled (routed)</dt><dd>Teen policies. <i>Incoming</i> is server ki taraf ka traffic. <i>Outgoing</i> is server se nikalta traffic. <i>Routed</i> woh traffic jo server se sirf guzarta hai; yeh server router nahi hai, isliye disabled.</dd>
<dt>New profiles: skip</dt><dd>Baad mein install hue application profiles apne aap nahi khulte. Achha: aapke faisle ke bina kuch nahi khulta.</dd>
</dl>
<p>Phir rule table aata hai. <b>To</b> is server par destination hai (port aur protocol), <b>Action</b> kya kiya jaata hai (<code>ALLOW IN</code> matlab incoming allow), aur <b>From</b> source hai: 10.99.0.0/24 jaisa network ya <code>Anywhere</code>. Row 1 ko vaakya ki tarah padho: "10.99.0.0/24 se aane wala TCP port 22 allow karo". Agar har row ko vaakya mein bol sako, to firewall samajh gaye.</p>

<div class="eg"><p><b>Worked example.</b> 10.20.0.10 se TCP port 22 ke liye packet aata hai. Rule 1 port 22 sirf 10.99.0.0/24 se allow karta hai: match nahi, source galat. Rule 2 UDP 514: match nahi. Rule 3 TCP 80: match nahi. Koi rule match nahi hua, isliye default policy tay karti hai: deny incoming. Packet drop. Wahi packet TCP port 80 ke liye rule 3 se match hota aur allow hota.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Deny default set karke SSH rule ke bina enable karna (lockout chapter 5 mein); yeh bhoolna ki ufw galat matlab ke rule ke liye bhi "Rule added" print karta hai; yeh maanna ki outgoing traffic bhi filter hota hai. Aam policy mein nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default deny un packets par lagta hai jo kisi rule se match na hon. Yeh list mein rule nahi hai, isliye <code>ufw status numbered</code> mein nahi dikhta; <code>ufw status verbose</code> mein milta hai.</p></div>
<div class="scn"><h4>Fail safe, fail open nahi</h4><p>Ek team port 8443 par naye internal API ka rule jodna bhool gayi. Default deny ke saath pehla test kuch minute mein fail hua aur owner ne bilkul wahi port bilkul ek network se khola. Doosre datacentre mein default allow tha; waise hi bhoole rule ne database port mahino tak poore campus ke liye khula chhoda.</p><p><b>Lesson:</b> woh default chuno jo galtiyon ko dikhaye.</p></div>
<div class="iv"><p class="q">"Server par kaunsi default policy lagaoge aur kyun?"</p><p>Deny incoming, allow outgoing. Incoming mein hamle aate hain, isliye sirf zaroori services zaroori networks se allow karta hoon. Outgoing updates aur logging ke liye khula rehta hai, aur sensitive servers par baad mein kasa ja sakta hai. Chhoota hua rule safe fail hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default policy un packets ko sambhalti hai jo kisi rule se match nahi karte; incoming ke liye deny chuno.</li>
<li>Firewall inactive ho tab bhi rules jode ja sakte hain; enable karne par lagu hote hain.</li>
<li><code>ufw status verbose</code> logging, defaults aur rule table dikhata hai.</li>
<li>Har rule ko vaakya mein bolkar check karo.</li>
</ul></div>
`}};export{r as default};