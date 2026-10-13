var e={id:`lab-pn-connect-ts`,h:{en:`Lab walkthrough: pn-connect-ts, three firewalls, three reasons`,hi:`Lab walkthrough: pn-connect-ts, teen firewalls, teen wajah`},body:{en:`
<p>A doctor with three patients who all say "I feel unwell" does not give all three the same medicine. She examines each one. Lab <b>pn-connect-ts</b> is the same: Pune, Delhi and Chennai all show Connected: no, and each has a different cause. Attempt the lab with the method from chapter 7. This page shows how the evidence reads, so you can compare with your own findings.</p>

<h3>The starting symptom</h3>
<pre class="out">&gt; show devices all                <span class="c">(on PANO)</span>
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------
0079185321121                                       <span class="hl">no</span>
0079151765883                                       <span class="hl">no</span>

Total managed devices: 2</pre>
<p>Two things are already visible without logging in anywhere. Only two serial numbers are on Panorama's list, although there are three firewalls. And the hostname and IP columns are empty: those two have never connected.</p>

<h3>Evidence per firewall</h3>
<table class="tbl"><tr><th>Firewall</th><th>Where the evidence is</th><th>What it says</th></tr>
<tr><td>NK-PUNE-PA</td><td>PA1: show panorama-status and ms.log</td><td>Server address shown is not Panorama's management IP; the log says no Panorama answers on that address.</td></tr>
<tr><td>NK-DELHI-PA</td><td>PANO: ms.log</td><td>Panorama rejected a connection from a serial that is not in its managed devices.</td></tr>
<tr><td>NK-CHENNAI-PA</td><td>PA3: ms.log and its management settings</td><td>Right server, right registration, but "no route to host on the management network".</td></tr>
</table>
<pre class="out">PA1&gt; show panorama-status
Panorama Server 1 : <span class="hl">192.0.2.5</span>
    Connected     : no

PA1&gt; less mp-log ms.log
Error: connection to Panorama server 192.0.2.5 failed: connection timed out (no Panorama answers on this address)

PANO&gt; less mp-log ms.log
Info: device 0079185321121 (NK-PUNE-PA) is registered but not connected
Info: device 0079151765883 (NK-CHENNAI-PA) is registered but not connected
Error: <span class="hl">rejected management connection from unknown device serial 0079134988264: not in managed devices</span>

PA3&gt; less mp-log ms.log
Error: connection to Panorama server 192.0.2.50 failed: <span class="hl">no route to host on the management network</span></pre>

<h3>Thinking it through</h3>
<p><b>Pune.</b> The address on the firewall is one digit short of Panorama's. That is a dial-the-wrong-number problem and the fix belongs on the firewall. <b>Delhi.</b> The firewall's own settings are correct, which is why its status looks reasonable; the missing piece is on Panorama, where its serial was never registered. Fixing the firewall would not help. <b>Chennai.</b> Look at the firewall's management configuration. Its management IP sits in a different subnet from Panorama's and there is no default gateway, so the networks cannot reach each other, even though server address and registration are right.</p>
<pre class="out">PA3&gt; show config running
deviceconfig {
  system {
    hostname NK-CHENNAI-PA;
    panorama-server 192.0.2.50;
    ip-address <span class="hl">192.0.3.13</span>;
    netmask 255.255.255.0;
  }
}</pre>
<p>Compare the management IP with the first three numbers of Panorama's 192.0.2.50, and note what the lab facts say about reachability: the networks must be the same subnet, or both sides must have default gateways.</p>

<h3>After the fixes</h3>
<p>Each fix is committed on the correct device. Then all three show Connected: yes in the inventory, and the last task asks which log file you read first to see the reason (a file you have already met).</p>
<pre class="out">&gt; show devices all
0079185321121     NK-PUNE-PA        192.0.2.11      <span class="hl">yes</span>
0079151765883     NK-CHENNAI-PA     192.0.2.13      <span class="hl">yes</span>
0079134988264     NK-DELHI-PA       192.0.2.12      <span class="hl">yes</span>
Total managed devices: 3</pre>

<div class="warn"><p><b>Common mistakes.</b> Fixing all three on the firewalls because "firewalls are the problem"; changing Panorama's address instead of the firewall's; resetting everything and losing the evidence; forgetting to commit on the device you changed. Remember: this lab models only the decision for a management connection; real networks may involve firewalls, routing and ports you must check in your own environment.</p></div>

<div class="scn"><h4>Ticket: "Panorama is broken"</h4><p>A helpdesk ticket said Panorama had stopped managing three sites. The engineer found Panorama healthy and three unrelated causes: a typo, a missed registration and a subnet error from a recent re-addressing. Closing the ticket with one line per site and the evidence from ms.log made the root causes visible and stopped the "Panorama is broken" story.</p><p><b>Lesson:</b> a shared symptom is not a shared cause.</p></div>

<div class="iv"><p class="q">"Three firewalls are disconnected. Where do you start?"</p><p>With the inventory: which serials are registered, which have hostnames. Then show panorama-status and ms.log on each firewall and on Panorama. Classify each by evidence and fix each on the device the evidence names.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the inventory first: missing serials and empty hostnames already tell a story.</li>
<li>ms.log on Panorama explains rejections; ms.log on the firewall explains failed calls.</li>
<li>The right fix can be on Panorama even when the symptom shows on a firewall.</li>
<li>Management subnet and gateway problems stop a connection with correct server and registration.</li>
<li>Same symptom, different causes: classify each device separately.</li>
</ul></div>
`,hi:`
<p>Teen patients jo sab bolen "mujhe tabiyat theek nahi lag rahi", unhe doctor teeno ko same dawai nahi deti. Wo har ek ko examine karti hai. Lab <b>pn-connect-ts</b> bhi yahi hai: Pune, Delhi aur Chennai sab Connected: no dikhate hain, aur har ek ka cause alag hai. Chapter 7 ke method se lab khud try karo. Ye page dikhata hai evidence kaise padhi jati hai, taaki aap apni findings se compare kar sako.</p>

<h3>Starting symptom</h3>
<pre class="out">&gt; show devices all                <span class="c">(PANO par)</span>
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------
0079185321121                                       <span class="hl">no</span>
0079151765883                                       <span class="hl">no</span>

Total managed devices: 2</pre>
<p>Kahin login kiye bina do cheezein dikh jati hain. Panorama ki list mein sirf do serial numbers hain, jabki firewalls teen hain. Aur hostname aur IP columns khaali hain: un do ne kabhi connect nahi kiya.</p>

<h3>Har firewall ki evidence</h3>
<table class="tbl"><tr><th>Firewall</th><th>Evidence kahan hai</th><th>Kya kehti hai</th></tr>
<tr><td>NK-PUNE-PA</td><td>PA1: show panorama-status aur ms.log</td><td>Dikhne wala server address Panorama ka management IP nahi hai; log kehta hai us address par koi Panorama jawab nahi deta.</td></tr>
<tr><td>NK-DELHI-PA</td><td>PANO: ms.log</td><td>Panorama ne aise serial se connection reject kiya jo uski managed devices mein nahi.</td></tr>
<tr><td>NK-CHENNAI-PA</td><td>PA3: ms.log aur uski management settings</td><td>Server sahi, registration sahi, par "no route to host on the management network".</td></tr>
</table>
<pre class="out">PA1&gt; show panorama-status
Panorama Server 1 : <span class="hl">192.0.2.5</span>
    Connected     : no

PA1&gt; less mp-log ms.log
Error: connection to Panorama server 192.0.2.5 failed: connection timed out (no Panorama answers on this address)

PANO&gt; less mp-log ms.log
Info: device 0079185321121 (NK-PUNE-PA) is registered but not connected
Info: device 0079151765883 (NK-CHENNAI-PA) is registered but not connected
Error: <span class="hl">rejected management connection from unknown device serial 0079134988264: not in managed devices</span>

PA3&gt; less mp-log ms.log
Error: connection to Panorama server 192.0.2.50 failed: <span class="hl">no route to host on the management network</span></pre>

<h3>Soch ke dekho</h3>
<p><b>Pune.</b> Firewall par address Panorama ke address se ek digit kam hai. Ye galat-number-dial karne ki problem hai aur fix firewall par hoga. <b>Delhi.</b> Firewall ki apni settings sahi hain, isliye uska status reasonable dikhta hai; missing piece Panorama par hai, jahan uska serial kabhi register nahi hua. Firewall fix karne se kuch nahi hota. <b>Chennai.</b> Firewall ki management configuration dekho. Uska management IP Panorama ke subnet se alag subnet mein hai aur default gateway nahi hai, isliye networks ek doosre tak nahi pahunch sakte, chahe server address aur registration sahi hon.</p>
<pre class="out">PA3&gt; show config running
deviceconfig {
  system {
    hostname NK-CHENNAI-PA;
    panorama-server 192.0.2.50;
    ip-address <span class="hl">192.0.3.13</span>;
    netmask 255.255.255.0;
  }
}</pre>
<p>Management IP ko Panorama ke 192.0.2.50 ke pehle teen numbers se compare karo, aur lab facts ki reachability wali baat yaad rakho: networks same subnet mein hon, ya dono taraf default gateways hon.</p>

<h3>Fixes ke baad</h3>
<p>Har fix sahi device par committed hai. Phir teeno inventory mein Connected: yes dikhate hain, aur last task puchta hai ki reason dekhne ke liye pehle kaunsi log file padhi (jis file se aap pehle mil chuke ho).</p>
<pre class="out">&gt; show devices all
0079185321121     NK-PUNE-PA        192.0.2.11      <span class="hl">yes</span>
0079151765883     NK-CHENNAI-PA     192.0.2.13      <span class="hl">yes</span>
0079134988264     NK-DELHI-PA       192.0.2.12      <span class="hl">yes</span>
Total managed devices: 3</pre>

<div class="warn"><p><b>Common mistakes.</b> "Firewalls hi problem hain" sochkar teeno firewalls par fix karna; firewall ke bajay Panorama ka address badalna; sab reset karke evidence kho dena; jis device par badla us par commit bhool jana. Yaad rakho: ye lab sirf management connection ka decision model karta hai; real networks mein firewalls, routing aur ports hote hain jo aapko apne environment mein check karne honge.</p></div>

<div class="scn"><h4>Ticket: "Panorama kharab hai"</h4><p>Helpdesk ticket mein likha tha ki Panorama ne teen sites manage karna band kar diya. Engineer ko Panorama healthy mila aur teen unrelated causes: ek typo, ek chhoota hua registration, aur haal ki re-addressing se ek subnet error. Har site ke liye ek line aur ms.log ki evidence ke saath ticket close karne se root causes dikhe aur "Panorama kharab hai" kahani band hui.</p><p><b>Lesson:</b> shared symptom ka matlab shared cause nahi.</p></div>

<div class="iv"><p class="q">"Teen firewalls disconnected hain. Kahan se shuru karoge?"</p><p>Inventory se: kaun se serials registered hain, kinke hostnames hain. Phir har firewall par aur Panorama par show panorama-status aur ms.log. Evidence se har ek ko classify karo aur har ek ko usi device par fix karo jiska naam evidence leti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle inventory padho: missing serials aur khaali hostnames pehle hi kahani bata dete hain.</li>
<li>Panorama par ms.log rejections explain karta hai; firewall par ms.log failed calls explain karta hai.</li>
<li>Symptom firewall par dikhe tab bhi sahi fix Panorama par ho sakta hai.</li>
<li>Management subnet aur gateway problems sahi server aur registration ke bawajood connection rokte hain.</li>
<li>Symptom same, causes alag: har device ko alag classify karo.</li>
</ul></div>
`}};export{e as default};