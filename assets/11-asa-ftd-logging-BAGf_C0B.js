var e={id:`asa-ftd-logging`,h:{en:`ASA and Threat Defense at a high level, and why logging matters`,hi:`ASA aur Threat Defense high level par, aur logging kyun zaroori hai`},body:{en:`
<p>Picture two security guards. The first is a veteran with a register: he checks every visitor against the rules, writes allowed visitors in the book and lets their replies back in. That is the <b>Cisco ASA</b>. The second guard has the same register, plus an X-ray machine, an ID scanner and a radio to headquarters, where one supervisor writes the rules for every building. That is <b>Cisco Secure Firewall Threat Defense</b> (FTD) managed by <b>Management Center</b> (FMC). Both guards also keep a diary. Without the diary, nobody can prove what happened at the door. That diary is <b>logging</b>, the second half of this chapter.</p>

<h3>Cisco ASA: the stateful firewall you will configure first</h3>
<p>The <b>Adaptive Security Appliance</b> software is a mature stateful firewall and VPN headend. It runs on Cisco Secure Firewall hardware and as <b>ASA Virtual</b> in private and public clouds. Everything in chapters 5 to 8 is ASA behaviour: the connection table, security levels, <code>nameif</code>, inspection engines in the Modular Policy Framework, and NAT. You manage it with the <b>CLI</b>, with <b>ASDM</b> (a GUI for one device), or centrally with Security Cloud Control. Typical uses today: remote-access and site-to-site VPN headend, pure Layer 3/4 stateful filtering, and multiple context mode (several virtual firewalls in one box).</p>
<p>A simplified ASA packet walk, the one you will prove with <code>packet-tracer</code> in sec-asa-tshoot:</p>
<ol>
<li>The packet arrives. Is there an existing <b>connection</b>? If yes, fast path: forward it (with its NAT) and skip the policy checks.</li>
<li>If not: route lookup and un-NAT (find the real destination), then the <b>interface ACL</b> or security-level check.</li>
<li>Inspection engines, then NAT, then a new <b>connection entry</b> is created.</li>
<li>Egress interface, next hop, transmit, and a syslog message such as 302013.</li>
</ol>

<h3>Threat Defense: an NGFW with two engines</h3>
<p><b>Threat Defense</b> is Cisco's NGFW image. Inside it are two engines working together:</p>
<ul>
<li><b>LINA</b>, derived from ASA code: interfaces, routing, NAT, Layer 3/4 access rules, VPN and the connection table. So <code>show conn</code>, <code>show xlate</code>, <code>packet-tracer</code> and <code>capture</code> still work on the FTD CLI.</li>
<li><b>Snort 3</b>: the deep inspection engine for application identification, URL filtering, user identity, Security Intelligence, intrusion prevention and file/malware policy.</li>
</ul>
<p>There is no configuration mode on the FTD CLI for policy. You build policy in <b>Management Center</b> (on-premises, virtual, or cloud-delivered) or in <b>Device Manager</b> (on-box, one device), then press <b>Deploy</b>. The central object is the <b>access control policy</b>: an ordered list of rules that can match zones, networks, ports, <b>applications</b>, URLs and users, with an intrusion policy and a file policy attached to allow rules.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ASA vs Threat Defense and logging">
<rect x="20" y="20" width="250" height="150" rx="12" fill="#bae6fd"/>
<text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="14">Cisco ASA</text>
<rect x="40" y="60" width="210" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="145" y="85" text-anchor="middle" class="svg-ink" font-size="12">stateful L3/L4 + VPN</text>
<text x="145" y="125" text-anchor="middle" class="svg-muted" font-size="12">managed: CLI, ASDM</text>
<text x="145" y="150" text-anchor="middle" class="svg-muted" font-size="12">policy: ACLs, levels</text>
<rect x="330" y="20" width="290" height="150" rx="12" fill="#ddd6fe"/>
<text x="475" y="45" text-anchor="middle" class="svg-ink" font-size="14">Threat Defense</text>
<rect x="345" y="60" width="120" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="405" y="85" text-anchor="middle" class="svg-ink" font-size="12">LINA: L3/L4</text>
<rect x="485" y="60" width="120" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="12">Snort 3: L7</text>
<line x1="465" y1="80" x2="485" y2="80" stroke="#64748b"/>
<text x="475" y="125" text-anchor="middle" class="svg-muted" font-size="12">managed: FMC or FDM, Deploy</text>
<text x="475" y="150" text-anchor="middle" class="svg-muted" font-size="12">policy: access control rules</text>
<line x1="145" y1="170" x2="280" y2="200" stroke="#64748b"/>
<line x1="475" y1="170" x2="360" y2="200" stroke="#64748b"/>
<rect x="220" y="200" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Logs: syslog, SIEM</text>
</svg><p class="cap">ASA is a stateful firewall; Threat Defense adds the Snort 3 engine for Layer 7 inspection. Both must send logs to a central place.</p></div>

<table class="cmp"><tr><th>Point</th><th>ASA</th><th>Threat Defense</th></tr>
<tr><td>Engine</td><td>ASA software (stateful)</td><td>LINA (stateful) + Snort 3 (NGFW, IPS)</td></tr>
<tr><td>Manage</td><td>CLI, ASDM, Security Cloud Control</td><td>Management Center, Device Manager, Security Cloud Control</td></tr>
<tr><td>Policy</td><td>Interface ACLs, security levels, MPF</td><td>Access control policy with zones, apps, URLs, users</td></tr>
<tr><td>Threat features</td><td>None built in beyond inspection</td><td>IPS, Security Intelligence, file and malware</td></tr>
<tr><td>Events</td><td>Syslog, NetFlow (NSEL)</td><td>Connection, intrusion, file and SI events to FMC, plus syslog</td></tr>
</table>

<h3>Why logging matters</h3>
<p>A firewall that does not log is a guard with no diary. Logs give you five things: <b>troubleshooting</b> (which rule dropped the packet), <b>detection</b> (a burst of denies is a scan), <b>incident response</b> (a timeline of who talked to whom), <b>compliance</b> (standards such as PCI DSS require logging and regular review), and <b>policy tuning</b> (rules that never match can be removed). The segmentation story in chapter 10 was solved by deny logs.</p>
<p>ASA messages have the form <code>%ASA-severity-ID: text</code>. Severity runs from <b>0 to 7</b>: 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging. A lower number is more severe, and choosing a level includes every level below it.</p>
<pre class="code"><span class="c">! Sensible ASA logging baseline</span>
logging enable
logging timestamp
logging device-id hostname
logging buffer-size 524288
logging buffered informational
<span class="c">! Send a copy to the central syslog/SIEM server</span>
logging trap informational
logging host inside 10.0.1.200</pre>
<pre class="out">NK-ASA# show logging
Syslog logging: enabled
    Timestamp logging: enabled
    Buffer logging: level informational, 128 messages logged
<span class="hl">    Trap logging: level informational, facility 20, 128 messages logged
        Logging to inside 10.0.1.200</span>
    Device ID: hostname "NK-ASA"</pre>
<p>On Threat Defense you choose logging per access rule: at the <b>beginning</b> and/or <b>end</b> of the connection. End-of-connection gives the full picture (bytes, duration, application); a block rule can log only at the beginning, because the connection never gets an end.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving logging disabled (it is off until <code>logging enable</code>). No timestamps and no NTP, so logs from three devices cannot be lined up. Logging at <code>debugging</code> to the console on a busy firewall, which can overload the CPU. Keeping logs only in the local buffer, which wraps and is lost on reload.</p></div>

<div class="exam"><p><b>Exam traps.</b> 106001 is severity 2, but 302013 connection builds are severity 6: a trap level of <code>warnings</code> sends the denies and hides every build. FTD policy is changed in FMC or FDM and takes effect only after <b>Deploy</b>. Snort handles Layer 7; LINA handles routing, NAT and Layer 3/4.</p></div>

<div class="scn"><h4>The breach nobody could date</h4><p>A retailer discovered a skimming script on its web server in the DMZ. The investigators asked a simple question: when did the server first talk to the unknown host? The ASA logged only to its local buffer at <code>warnings</code>, so connection builds were never recorded, and the buffer had wrapped long ago. The team rebuilt the timeline from the web server's own logs, weeks later. The fix: <code>logging trap informational</code> to a SIEM, NTP on every device, and FTD connection events logged at end of connection.</p><p><b>Lesson:</b> you cannot investigate what you did not record. Decide logging before the incident, not after.</p></div>

<div class="iv"><p class="q">"What is the difference between ASA and Threat Defense?"</p><p>ASA is a stateful Layer 3/4 firewall and VPN headend managed by CLI or ASDM. Threat Defense is the NGFW: an ASA-derived LINA engine for routing, NAT and L3/L4 rules plus Snort 3 for application control, URL filtering, IPS and file/malware inspection, managed by Management Center or Device Manager with a deploy step. Add that both should log centrally, and name one syslog ID.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA: stateful firewall and VPN headend; CLI and ASDM; ACLs and security levels.</li>
<li>Threat Defense: LINA (L3/L4, NAT, VPN) plus Snort 3 (apps, URL, IPS, files); policy in FMC or FDM, then Deploy.</li>
<li>Logs serve troubleshooting, detection, incident response, compliance and tuning.</li>
<li>Syslog severity 0 to 7; lower is more severe; a level includes all lower numbers.</li>
<li>Always: logging enabled, timestamps, NTP, and a copy to a central SIEM.</li>
</ul></div>
`,hi:`
<p>Do security guards ki tasveer socho. Pehla ek veteran hai jiske paas register hai: woh har visitor ko rules se check karta hai, allowed visitors ko book mein likhta hai aur unke replies ko wapas andar aane deta hai. Woh hai <b>Cisco ASA</b>. Doosre guard ke paas wahi register hai, plus ek X-ray machine, ek ID scanner aur headquarters tak radio, jahan ek supervisor har building ke rules likhta hai. Woh hai <b>Management Center</b> (FMC) se managed <b>Cisco Secure Firewall Threat Defense</b> (FTD). Dono guards ek diary bhi rakhte hain. Diary ke bina koi prove nahi kar sakta ki darwaze par kya hua. Woh diary hai <b>logging</b>, is chapter ka doosra hissa.</p>

<h3>Cisco ASA: woh stateful firewall jo aap pehle configure karoge</h3>
<p><b>Adaptive Security Appliance</b> software ek mature stateful firewall aur VPN headend hai. Yeh Cisco Secure Firewall hardware par aur private aur public clouds mein <b>ASA Virtual</b> ki tarah chalta hai. Chapter 5 se 8 tak sab kuch ASA behaviour hai: connection table, security levels, <code>nameif</code>, Modular Policy Framework mein inspection engines, aur NAT. Ise aap <b>CLI</b> se, <b>ASDM</b> (ek device ke liye GUI) se, ya Security Cloud Control se centrally manage karte ho. Aaj ke typical uses: remote-access aur site-to-site VPN headend, pure Layer 3/4 stateful filtering, aur multiple context mode (ek box mein kai virtual firewalls).</p>
<p>Ek simplified ASA packet walk, jo aap sec-asa-tshoot mein <code>packet-tracer</code> se prove karoge:</p>
<ol>
<li>Packet aata hai. Kya koi existing <b>connection</b> hai? Agar haan, fast path: use (uske NAT ke saath) forward karo aur policy checks skip karo.</li>
<li>Agar nahi: route lookup aur un-NAT (asli destination dhoondo), phir <b>interface ACL</b> ya security-level check.</li>
<li>Inspection engines, phir NAT, phir ek nayi <b>connection entry</b> banti hai.</li>
<li>Egress interface, next hop, transmit, aur 302013 jaisa ek syslog message.</li>
</ol>

<h3>Threat Defense: do engines wala NGFW</h3>
<p><b>Threat Defense</b> Cisco ka NGFW image hai. Iske andar do engines saath kaam karte hain:</p>
<ul>
<li><b>LINA</b>, ASA code se bana: interfaces, routing, NAT, Layer 3/4 access rules, VPN aur connection table. Isliye <code>show conn</code>, <code>show xlate</code>, <code>packet-tracer</code> aur <code>capture</code> FTD CLI par bhi chalte hain.</li>
<li><b>Snort 3</b>: application identification, URL filtering, user identity, Security Intelligence, intrusion prevention aur file/malware policy ke liye deep inspection engine.</li>
</ul>
<p>FTD CLI par policy ke liye koi configuration mode nahi hai. Policy aap <b>Management Center</b> (on-premises, virtual, ya cloud-delivered) mein ya <b>Device Manager</b> (on-box, ek device) mein banate ho, phir <b>Deploy</b> dabate ho. Central object hai <b>access control policy</b>: rules ki ordered list jo zones, networks, ports, <b>applications</b>, URLs aur users match kar sakti hai, aur allow rules ke saath intrusion policy aur file policy attached hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ASA vs Threat Defense aur logging">
<rect x="20" y="20" width="250" height="150" rx="12" fill="#bae6fd"/>
<text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="14">Cisco ASA</text>
<rect x="40" y="60" width="210" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="145" y="85" text-anchor="middle" class="svg-ink" font-size="12">stateful L3/L4 + VPN</text>
<text x="145" y="125" text-anchor="middle" class="svg-muted" font-size="12">manage: CLI, ASDM</text>
<text x="145" y="150" text-anchor="middle" class="svg-muted" font-size="12">policy: ACLs, levels</text>
<rect x="330" y="20" width="290" height="150" rx="12" fill="#ddd6fe"/>
<text x="475" y="45" text-anchor="middle" class="svg-ink" font-size="14">Threat Defense</text>
<rect x="345" y="60" width="120" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="405" y="85" text-anchor="middle" class="svg-ink" font-size="12">LINA: L3/L4</text>
<rect x="485" y="60" width="120" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="12">Snort 3: L7</text>
<line x1="465" y1="80" x2="485" y2="80" stroke="#64748b"/>
<text x="475" y="125" text-anchor="middle" class="svg-muted" font-size="12">manage: FMC ya FDM, Deploy</text>
<text x="475" y="150" text-anchor="middle" class="svg-muted" font-size="12">policy: access control rules</text>
<line x1="145" y1="170" x2="280" y2="200" stroke="#64748b"/>
<line x1="475" y1="170" x2="360" y2="200" stroke="#64748b"/>
<rect x="220" y="200" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Logs: syslog, SIEM</text>
</svg><p class="cap">ASA stateful firewall hai; Threat Defense Layer 7 inspection ke liye Snort 3 engine jodta hai. Dono ko logs ek central jagah bhejne chahiye.</p></div>

<table class="cmp"><tr><th>Point</th><th>ASA</th><th>Threat Defense</th></tr>
<tr><td>Engine</td><td>ASA software (stateful)</td><td>LINA (stateful) + Snort 3 (NGFW, IPS)</td></tr>
<tr><td>Manage</td><td>CLI, ASDM, Security Cloud Control</td><td>Management Center, Device Manager, Security Cloud Control</td></tr>
<tr><td>Policy</td><td>Interface ACLs, security levels, MPF</td><td>Zones, apps, URLs, users ke saath access control policy</td></tr>
<tr><td>Threat features</td><td>Inspection ke alawa kuch built-in nahi</td><td>IPS, Security Intelligence, file aur malware</td></tr>
<tr><td>Events</td><td>Syslog, NetFlow (NSEL)</td><td>FMC ko connection, intrusion, file aur SI events, plus syslog</td></tr>
</table>

<h3>Logging kyun zaroori hai</h3>
<p>Jo firewall log nahi karta woh bina diary ka guard hai. Logs aapko paanch cheezein dete hain: <b>troubleshooting</b> (kis rule ne packet drop kiya), <b>detection</b> (denies ka burst ek scan hai), <b>incident response</b> (kisne kisse baat ki, uski timeline), <b>compliance</b> (PCI DSS jaise standards logging aur regular review maangte hain), aur <b>policy tuning</b> (jo rules kabhi match nahi hote unhe hataya ja sakta hai). Chapter 10 ki segmentation kahani deny logs se hi solve hui thi.</p>
<p>ASA messages ka form hai <code>%ASA-severity-ID: text</code>. Severity <b>0 se 7</b> tak jaati hai: 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging. Chhota number zyada severe hai, aur ek level chunne par uske neeche ke saare levels shaamil ho jaate hain.</p>
<pre class="code"><span class="c">! Samajhdaar ASA logging baseline</span>
logging enable
logging timestamp
logging device-id hostname
logging buffer-size 524288
logging buffered informational
<span class="c">! Central syslog/SIEM server ko ek copy bhejo</span>
logging trap informational
logging host inside 10.0.1.200</pre>
<pre class="out">NK-ASA# show logging
Syslog logging: enabled
    Timestamp logging: enabled
    Buffer logging: level informational, 128 messages logged
<span class="hl">    Trap logging: level informational, facility 20, 128 messages logged
        Logging to inside 10.0.1.200</span>
    Device ID: hostname "NK-ASA"</pre>
<p>Threat Defense par aap har access rule ke liye logging chunte ho: connection ki <b>beginning</b> aur/ya <b>end</b> par. End-of-connection poori picture deta hai (bytes, duration, application); block rule sirf beginning par log kar sakta hai, kyunki us connection ka kabhi end aata hi nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> Logging disabled chhod dena (<code>logging enable</code> tak yeh off rehti hai). Na timestamps, na NTP, isliye teen devices ke logs line up nahi ho sakte. Busy firewall par console ko <code>debugging</code> level par log karna, jo CPU overload kar sakta hai. Logs sirf local buffer mein rakhna, jo wrap ho jaata hai aur reload par kho jaata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> 106001 severity 2 hai, lekin 302013 connection builds severity 6 hain: <code>warnings</code> ka trap level denies bhejta hai aur har build chhupa deta hai. FTD policy FMC ya FDM mein badalti hai aur sirf <b>Deploy</b> ke baad lagu hoti hai. Snort Layer 7 handle karta hai; LINA routing, NAT aur Layer 3/4 handle karta hai.</p></div>

<div class="scn"><h4>Woh breach jiski date koi nahi bata saka</h4><p>Ek retailer ko DMZ ke web server par ek skimming script mili. Investigators ne simple sawaal poocha: server ne pehli baar unknown host se kab baat ki? ASA sirf apne local buffer mein <code>warnings</code> par log karta tha, isliye connection builds kabhi record hi nahi hue, aur buffer bahut pehle wrap ho chuka tha. Team ne hafton baad web server ke apne logs se timeline dobara banayi. Fix: SIEM ko <code>logging trap informational</code>, har device par NTP, aur FTD connection events end of connection par log.</p><p><b>Seekh:</b> jo aapne record nahi kiya uski investigation nahi kar sakte. Logging incident se pehle decide karo, baad mein nahi.</p></div>

<div class="iv"><p class="q">"ASA aur Threat Defense mein kya farak hai?"</p><p>ASA ek stateful Layer 3/4 firewall aur VPN headend hai jo CLI ya ASDM se manage hota hai. Threat Defense NGFW hai: routing, NAT aur L3/L4 rules ke liye ASA se bana LINA engine plus application control, URL filtering, IPS aur file/malware inspection ke liye Snort 3, jo Management Center ya Device Manager se deploy step ke saath manage hota hai. Yeh bhi jodo ki dono ko centrally log karna chahiye, aur ek syslog ID ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA: stateful firewall aur VPN headend; CLI aur ASDM; ACLs aur security levels.</li>
<li>Threat Defense: LINA (L3/L4, NAT, VPN) plus Snort 3 (apps, URL, IPS, files); policy FMC ya FDM mein, phir Deploy.</li>
<li>Logs troubleshooting, detection, incident response, compliance aur tuning ke kaam aate hain.</li>
<li>Syslog severity 0 se 7; chhota zyada severe; ek level mein saare chhote numbers shaamil.</li>
<li>Hamesha: logging enabled, timestamps, NTP, aur central SIEM ko ek copy.</li>
</ul></div>
`}};export{e as default};