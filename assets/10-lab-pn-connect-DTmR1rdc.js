var e={id:`lab-pn-connect`,h:{en:`Lab walkthrough: pn-connect, bring two firewalls under Panorama`,hi:`Lab walkthrough: pn-connect, do firewalls ko Panorama ke under lao`},body:{en:`
<p>Think of moving two shops into a new shopping mall. The mall office needs a list of tenants (registration), each shop needs to know the mall office address (whom to report to), and then both are put on the right floor plan (groups). Lab <b>pn-connect</b> is exactly this. Try the lab first; use this page to check your reasoning, not to copy.</p>

<h3>Starting state</h3>
<p>NK-PUNE-PA (PA1, 192.0.2.11) and NK-DELHI-PA (PA2, 192.0.2.12) are managed one by one. Panorama (PANO, 192.0.2.50) has no managed devices. At the start, show devices all on Panorama is empty:</p>
<pre class="out">&gt; show devices all
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------

Total managed devices: 0</pre>

<h3>The four tasks and the logic behind them</h3>
<table class="tbl"><tr><th>Task</th><th>Logic</th><th>Device</th></tr>
<tr><td>1. Point firewalls at Panorama</td><td>Each firewall needs to know whom to call. You also need to read each firewall's serial number for the next task.</td><td>PA1 and PA2</td></tr>
<tr><td>2. Register the serials</td><td>Panorama accepts only devices on its list. Two commits (firewall and Panorama) must both be in place for Connected: yes.</td><td>PANO</td></tr>
<tr><td>3. Create a device group and a template stack</td><td>Connected is not assigned. A name and a membership list are needed, and both firewalls belong in both containers.</td><td>PANO</td></tr>
<tr><td>4. Name the TCP port</td><td>Recall chapter 3: the port used for management and log forwarding.</td><td>Answer box</td></tr>
</table>

<h3>Command shapes</h3>
<p>Use these as shapes. Replace the values yourself, and read the serial numbers from the firewalls rather than guessing them.</p>
<pre class="code"><span class="c">! on each firewall</span>
&gt; show system info
&gt; configure
# set deviceconfig system panorama-server &lt;panorama-ip&gt;
# commit

<span class="c">! on Panorama</span>
&gt; configure
# set mgt-config devices &lt;serial-of-firewall&gt;
# set device-group &lt;name&gt; devices &lt;serial-of-firewall&gt;
# set template-stack &lt;name&gt; devices &lt;serial-of-firewall&gt;
# commit</pre>

<h3>What success looks like</h3>
<p>After a correct run the inventory shows both firewalls connected and assigned, and the firewall agrees:</p>
<pre class="out">&gt; show devices connected
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------
0079185321121     NK-PUNE-PA        192.0.2.11      <span class="hl">yes</span>        NK-BRANCHES       NK-STACK          Out of Sync   Out of Sync
0079134988264     NK-DELHI-PA       192.0.2.12      <span class="hl">yes</span>        NK-BRANCHES       NK-STACK          Out of Sync   Out of Sync

Total connected devices: 2

&gt; show panorama-status       <span class="c">(on PA1)</span>
Panorama Server 1 : 192.0.2.50
    Connected     : yes
    HA state      : disconnected

&gt; less mp-log ms.log         <span class="c">(on PANO)</span>
Info: device 0079185321121 (NK-PUNE-PA) connected
Info: device 0079134988264 (NK-DELHI-PA) connected</pre>
<p>Why Out of Sync? Nothing has been pushed yet, which is correct for a freshly onboarded firewall (chapter 6). The job list shows only Commit jobs, because pushes come later in the track.</p>

<div class="eg"><p><b>Worked example.</b> Suppose you finish task 1 and 2 but still see Connected: no. Ask the three questions from chapter 7. The firewall status shows the address; the log says whether Panorama saw a call from an unknown serial; a typo in the serial would produce exactly that. You fix the one thing the evidence names, commit on that device, and check again.</p></div>

<div class="warn"><p><b>Common mistakes in this lab.</b> Typing the serial number by hand with an error (copy it from show system info); committing only on the firewalls or only on Panorama; adding the device to the device group but not to the template stack; adding the firewall to a group before it is registered. Remember the simulator does not model licensing, certificates or the GUI; on real systems, follow the documentation for your PAN-OS version.</p></div>

<div class="scn"><h4>Pilot onboarding at a new office</h4><p>An engineer onboarded two pilot firewalls the evening before a go-live. The sequence was: gather serials, set panorama-server on each firewall, register on Panorama, create the group and stack, verify with show devices connected and show panorama-status, then screenshot the output for the change record.</p><p><b>Lesson:</b> a short, repeatable runbook turns onboarding the tenth firewall into a routine task.</p></div>

<div class="iv"><p class="q">"You added the Panorama address on a new firewall, but Panorama shows nothing. What is missing?"</p><p>Registration: the firewall's serial must be in managed devices on Panorama, and Panorama's configuration must be committed. Also verify the management network path between them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Onboarding = panorama-server on the firewall plus the serial on Panorama, both committed.</li>
<li>Read the serial from show system info; do not type from memory.</li>
<li>Connected devices still need a device group and template stack to receive configuration.</li>
<li>Out of Sync after onboarding is expected until the first push.</li>
<li>Verify from both sides: show panorama-status and show devices connected.</li>
</ul></div>
`,hi:`
<p>Socho do shops naye shopping mall mein shift ho rahi hain. Mall office ko tenants ki list chahiye (registration), har shop ko mall office ka address pata hona chahiye (kisko report karna hai), aur phir dono ko sahi floor plan par rakha jata hai (groups). Lab <b>pn-connect</b> bilkul yahi hai. Pehle lab khud try karo; is page ko apni soch check karne ke liye use karo, copy karne ke liye nahi.</p>

<h3>Starting state</h3>
<p>NK-PUNE-PA (PA1, 192.0.2.11) aur NK-DELHI-PA (PA2, 192.0.2.12) ek-ek karke manage hote hain. Panorama (PANO, 192.0.2.50) ke paas koi managed device nahi. Shuru mein Panorama par show devices all khaali hai:</p>
<pre class="out">&gt; show devices all
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------

Total managed devices: 0</pre>

<h3>Chaar tasks aur unke peeche ka logic</h3>
<table class="tbl"><tr><th>Task</th><th>Logic</th><th>Device</th></tr>
<tr><td>1. Firewalls ko Panorama par point karo</td><td>Har firewall ko pata hona chahiye kise call karna hai. Agle task ke liye har firewall ka serial number bhi padhna hai.</td><td>PA1 aur PA2</td></tr>
<tr><td>2. Serials register karo</td><td>Panorama sirf apni list ke devices accept karta hai. Connected: yes ke liye dono commits (firewall aur Panorama) hone chahiye.</td><td>PANO</td></tr>
<tr><td>3. Device group aur template stack banao</td><td>Connected ka matlab assigned nahi. Naam aur membership list chahiye, aur dono firewalls dono containers mein hone chahiye.</td><td>PANO</td></tr>
<tr><td>4. TCP port ka naam batao</td><td>Chapter 3 yaad karo: management aur log forwarding ke liye jo port use hota hai.</td><td>Answer box</td></tr>
</table>

<h3>Command shapes</h3>
<p>Inhe shape ki tarah use karo. Values khud badlo, aur serial numbers firewalls se padho, andaza mat lagao.</p>
<pre class="code"><span class="c">! har firewall par</span>
&gt; show system info
&gt; configure
# set deviceconfig system panorama-server &lt;panorama-ip&gt;
# commit

<span class="c">! Panorama par</span>
&gt; configure
# set mgt-config devices &lt;serial-of-firewall&gt;
# set device-group &lt;name&gt; devices &lt;serial-of-firewall&gt;
# set template-stack &lt;name&gt; devices &lt;serial-of-firewall&gt;
# commit</pre>

<h3>Success kaisi dikhti hai</h3>
<p>Sahi run ke baad inventory dono firewalls connected aur assigned dikhati hai, aur firewall bhi agree karta hai:</p>
<pre class="out">&gt; show devices connected
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------
0079185321121     NK-PUNE-PA        192.0.2.11      <span class="hl">yes</span>        NK-BRANCHES       NK-STACK          Out of Sync   Out of Sync
0079134988264     NK-DELHI-PA       192.0.2.12      <span class="hl">yes</span>        NK-BRANCHES       NK-STACK          Out of Sync   Out of Sync

Total connected devices: 2

&gt; show panorama-status       <span class="c">(PA1 par)</span>
Panorama Server 1 : 192.0.2.50
    Connected     : yes
    HA state      : disconnected

&gt; less mp-log ms.log         <span class="c">(PANO par)</span>
Info: device 0079185321121 (NK-PUNE-PA) connected
Info: device 0079134988264 (NK-DELHI-PA) connected</pre>
<p>Out of Sync kyun? Abhi kuch push nahi hua, jo naye onboard hue firewall ke liye sahi hai (chapter 6). Job list sirf Commit jobs dikhati hai, kyunki push track mein baad mein aate hain.</p>

<div class="eg"><p><b>Worked example.</b> Maan lo task 1 aur 2 ho gaye par Connected: no hi dikh raha hai. Chapter 7 ke teen sawal poochho. Firewall status address dikhata hai; log batata hai ki Panorama ne unknown serial ki call dekhi ya nahi; serial mein typo exactly wahi paida karta. Jo ek cheez evidence batati hai wahi fix karo, us device par commit, aur dobara check.</p></div>

<div class="warn"><p><b>Is lab mein common mistakes.</b> Serial number haath se galti ke saath type karna (show system info se copy karo); sirf firewalls par ya sirf Panorama par commit karna; device ko device group mein jodna par template stack mein nahi; registered hone se pehle firewall ko group mein jodna. Yaad rakho simulator licensing, certificates ya GUI model nahi karta; real systems par apne PAN-OS version ki documentation follow karo.</p></div>

<div class="scn"><h4>Naye office par pilot onboarding</h4><p>Engineer ne go-live se ek sham pehle do pilot firewalls onboard kiye. Sequence: serials gather, har firewall par panorama-server set, Panorama par register, group aur stack banao, show devices connected aur show panorama-status se verify, phir change record ke liye output ka screenshot.</p><p><b>Lesson:</b> chhota repeatable runbook dasvein firewall ko onboard karna routine task bana deta hai.</p></div>

<div class="iv"><p class="q">"Naye firewall par Panorama address daal diya, par Panorama kuch nahi dikha raha. Kya missing hai?"</p><p>Registration: firewall ka serial Panorama par managed devices mein hona chahiye, aur Panorama ki configuration committed. Dono ke beech management network path bhi verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Onboarding = firewall par panorama-server plus Panorama par serial, dono committed.</li>
<li>Serial show system info se padho; yaad se type mat karo.</li>
<li>Connected devices ko configuration paane ke liye device group aur template stack chahiye.</li>
<li>Onboarding ke baad Out of Sync pehle push tak expected hai.</li>
<li>Dono taraf se verify: show panorama-status aur show devices connected.</li>
</ul></div>
`}};export{e as default};