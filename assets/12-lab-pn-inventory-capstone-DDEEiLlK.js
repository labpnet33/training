var e={id:`lab-pn-inventory-capstone`,h:{en:`Lab walkthrough: pn-inventory, plus a capstone scenario`,hi:`Lab walkthrough: pn-inventory, aur capstone scenario`},body:{en:`
<p>Think of a school principal with three classes, two in the main building and one in a new annexe. She wants a notice delivered to the main building only, and then wants to check which classes received it. She uses the class list (groups), writes the notice once (a rule), delivers it to the right classes (a push) and checks the register (the inventory). Lab <b>pn-inventory</b> asks you to do exactly that for firewalls. Attempt it first.</p>

<h3>Starting state</h3>
<p>All three firewalls are already connected: Pune, Delhi and Chennai. They are in no device group yet, so the Device group, Template stack and sync columns are empty:</p>
<pre class="out">&gt; show devices all
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------
0079185321121     NK-PUNE-PA        192.0.2.11      yes
0079134988264     NK-DELHI-PA       192.0.2.12      yes
0079151765883     NK-CHENNAI-PA     192.0.2.13      yes

Total managed devices: 3</pre>

<h3>Tasks and logic</h3>
<table class="tbl"><tr><th>Task</th><th>Logic</th></tr>
<tr><td>1. Two device groups</td><td>NK-BRANCHES for Pune and Delhi, NK-SOUTH for Chennai; commit to Panorama so the grouping is running configuration.</td></tr>
<tr><td>2. One pre-rule, then push</td><td>The rule lives in the NK-BRANCHES group, so only its members can receive it. A commit alone does not deliver; the device group must be pushed.</td></tr>
<tr><td>3. Count managed devices</td><td>Read the total from the inventory output.</td></tr>
</table>
<p>The rule belongs in the pre-rulebase, which means it is evaluated before any local rules on the firewall. Its shape, as a reference configuration:</p>
<pre class="code">set device-group &lt;name&gt; pre-rulebase security rules &lt;rule&gt; from any to any source any destination any application ssh service application-default action deny
commit
exit
commit-all shared-policy device-group &lt;name&gt;</pre>

<h3>Reading the result</h3>
<p>After the push, the inventory shows who received the policy and who did not. The difference between In Sync and Out of Sync is the point of the lab:</p>
<pre class="out">&gt; show devicegroups
Group NK-BRANCHES:
    Parent: Shared
    0079185321121     NK-PUNE-PA          Shared policy: <span class="hl">In Sync</span>
    0079134988264     NK-DELHI-PA         Shared policy: <span class="hl">In Sync</span>

Group NK-SOUTH:
    Parent: Shared
    0079151765883     NK-CHENNAI-PA       Shared policy: <span class="hl">Out of Sync</span></pre>
<p>On Pune, <code>show running security-policy</code> now lists the rule, and on Chennai it is empty. Chennai is Out of Sync because it is in a different group, where nothing was pushed. That is correct behaviour, not an error.</p>

<h3>Capstone scenario: a new site joins</h3>
<p>Network Kings opens a fourth site, Kolkata. Plan the work with what you have learned in this module, and name the device for each step.</p>
<ol>
<li><b>Management network.</b> Give the firewall a management IP in 192.0.2.0/24 with gateway 192.0.2.1, or confirm both sides have gateways. (Firewall.)</li>
<li><b>Point at Panorama.</b> Set panorama-server to Panorama's management IP and commit. (Firewall.)</li>
<li><b>Register.</b> Copy the serial from show system info into managed devices and commit. (Panorama.)</li>
<li><b>Assign.</b> Place the serial in the right device group and template stack and commit. (Panorama.)</li>
<li><b>Verify.</b> show panorama-status on the firewall, show devices connected and the sync columns on Panorama. (Both.)</li>
<li><b>Deliver.</b> Push policy and templates as the later modules teach, and re-check that the state turns In Sync.</li>
<li><b>Record.</b> Save the outputs in the change record.</li>
</ol>
<p>If step 5 shows Connected: no, return to chapter 7 and classify the failure by evidence.</p>

<div class="eg"><p><b>Worked example.</b> Kolkata is registered but shows Connected: no. Panorama's ms.log says "rejected management connection from unknown device serial". The serial you copied had one digit wrong. You correct it on Panorama, commit there, and the next check shows Connected: yes. The fix never touched the Kolkata firewall.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting a commit to deliver policy; assuming Out of Sync on a non-target group is a fault; putting Chennai in the wrong group and wondering why it lacks the rule; counting only connected devices when the question asks for managed devices.</p></div>

<div class="scn"><h4>The rule that Chennai never got</h4><p>A manager asked why the new SSH block did not apply in Chennai. The engineer checked the inventory: Chennai was in a different device group, so the rule published to the branches never targeted it, and the Out of Sync flag simply showed that its group had nothing delivered. The team added the rule to the south group on purpose.</p><p><b>Lesson:</b> check group membership before assuming a push failed.</p></div>

<div class="iv"><p class="q">"How can you tell from Panorama which firewalls received a policy?"</p><p>Use show devices all and show devicegroups to see group membership and the sync state per firewall; confirm on a firewall with show running security-policy; check show jobs all that the push job finished.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device group membership decides which firewalls can receive a rule.</li>
<li>Commit changes Panorama; a push delivers to firewalls.</li>
<li>In Sync or Out of Sync is per group and per firewall, readable in the inventory.</li>
<li>Pre-rules are evaluated before local rules on the firewall.</li>
<li>The new-site runbook: network, point, register, assign, verify, deliver, record.</li>
</ul></div>
`,hi:`
<p>Socho ek school principal ke paas teen classes hain, do main building mein aur ek nayi annexe mein. Wo ek notice sirf main building mein bhejna chahti hai, aur phir check karna chahti hai kin classes ko mila. Wo class list (groups) use karti hai, notice ek baar likhti hai (rule), sahi classes tak pahunchati hai (push) aur register check karti hai (inventory). Lab <b>pn-inventory</b> firewalls ke liye bilkul yahi karne ko kehta hai. Pehle khud try karo.</p>

<h3>Starting state</h3>
<p>Teeno firewalls pehle se connected hain: Pune, Delhi aur Chennai. Wo abhi kisi device group mein nahi hain, isliye Device group, Template stack aur sync columns khaali hain:</p>
<pre class="out">&gt; show devices all
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------
0079185321121     NK-PUNE-PA        192.0.2.11      yes
0079134988264     NK-DELHI-PA       192.0.2.12      yes
0079151765883     NK-CHENNAI-PA     192.0.2.13      yes

Total managed devices: 3</pre>

<h3>Tasks aur logic</h3>
<table class="tbl"><tr><th>Task</th><th>Logic</th></tr>
<tr><td>1. Do device groups</td><td>Pune aur Delhi ke liye NK-BRANCHES, Chennai ke liye NK-SOUTH; Panorama par commit karo taaki grouping running configuration ban jaye.</td></tr>
<tr><td>2. Ek pre-rule, phir push</td><td>Rule NK-BRANCHES group mein hai, isliye sirf uske members ko mil sakta hai. Sirf commit deliver nahi karta; device group push karna padta hai.</td></tr>
<tr><td>3. Managed devices ginti</td><td>Total inventory output se padho.</td></tr>
</table>
<p>Rule pre-rulebase mein hai, matlab firewall ke local rules se pehle evaluate hota hai. Uska shape, reference configuration ke taur par:</p>
<pre class="code">set device-group &lt;name&gt; pre-rulebase security rules &lt;rule&gt; from any to any source any destination any application ssh service application-default action deny
commit
exit
commit-all shared-policy device-group &lt;name&gt;</pre>

<h3>Result padhna</h3>
<p>Push ke baad inventory dikhati hai kisko policy mili aur kisko nahi. In Sync aur Out of Sync ka difference hi lab ka point hai:</p>
<pre class="out">&gt; show devicegroups
Group NK-BRANCHES:
    Parent: Shared
    0079185321121     NK-PUNE-PA          Shared policy: <span class="hl">In Sync</span>
    0079134988264     NK-DELHI-PA         Shared policy: <span class="hl">In Sync</span>

Group NK-SOUTH:
    Parent: Shared
    0079151765883     NK-CHENNAI-PA       Shared policy: <span class="hl">Out of Sync</span></pre>
<p>Pune par <code>show running security-policy</code> ab rule list karta hai, aur Chennai par khaali hai. Chennai Out of Sync hai kyunki wo alag group mein hai, jahan kuch push nahi hua. Ye sahi behaviour hai, error nahi.</p>

<h3>Capstone scenario: naya site judta hai</h3>
<p>Network Kings chauthi site, Kolkata, kholta hai. Is module mein jo seekha usse kaam plan karo, aur har step ke liye device batao.</p>
<ol>
<li><b>Management network.</b> Firewall ko 192.0.2.0/24 mein gateway 192.0.2.1 ke saath management IP do, ya confirm karo ki dono taraf gateways hain. (Firewall.)</li>
<li><b>Panorama par point karo.</b> panorama-server ko Panorama ke management IP par set karo aur commit. (Firewall.)</li>
<li><b>Register.</b> show system info se serial managed devices mein copy karo aur commit. (Panorama.)</li>
<li><b>Assign.</b> Serial ko sahi device group aur template stack mein rakho aur commit. (Panorama.)</li>
<li><b>Verify.</b> Firewall par show panorama-status, Panorama par show devices connected aur sync columns. (Dono.)</li>
<li><b>Deliver.</b> Policy aur templates push karo jaisa aage ke modules sikhate hain, aur dobara check karo ki state In Sync ho gayi.</li>
<li><b>Record.</b> Outputs change record mein save karo.</li>
</ol>
<p>Step 5 mein Connected: no dikhe to chapter 7 par wapas jao aur evidence se failure classify karo.</p>

<div class="eg"><p><b>Worked example.</b> Kolkata registered hai par Connected: no dikhata hai. Panorama ka ms.log kehta hai "rejected management connection from unknown device serial". Jo serial copy kiya usme ek digit galat tha. Panorama par sahi karke wahin commit karte ho, aur agla check Connected: yes dikhata hai. Fix ne Kolkata firewall ko kabhi chhua hi nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Commit se policy deliver hone ki ummeed; non-target group par Out of Sync ko fault samajhna; Chennai ko galat group mein rakhkar sochna ki rule kyun nahi hai; sawal managed devices maange to sirf connected devices ginna.</p></div>

<div class="scn"><h4>Wo rule jo Chennai ko kabhi nahi mila</h4><p>Manager ne pucha naya SSH block Chennai mein kyun lagu nahi hua. Engineer ne inventory check ki: Chennai alag device group mein tha, isliye branches ko publish hua rule use kabhi target hi nahi karta tha, aur Out of Sync flag sirf dikha raha tha ki uske group mein kuch deliver nahi hua. Team ne rule south group mein jaanbujhkar jodha.</p><p><b>Lesson:</b> push fail hua maanne se pehle group membership check karo.</p></div>

<div class="iv"><p class="q">"Panorama se kaise pata chalega kin firewalls ko policy mili?"</p><p>show devices all aur show devicegroups se group membership aur har firewall ki sync state dekho; firewall par show running security-policy se confirm karo; show jobs all mein dekho ki push job finish hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device group membership decide karta hai kaun se firewalls rule paa sakte hain.</li>
<li>Commit Panorama badalta hai; push firewalls tak deliver karta hai.</li>
<li>In Sync ya Out of Sync per group aur per firewall hai, inventory mein padhne layak.</li>
<li>Pre-rules firewall ke local rules se pehle evaluate hote hain.</li>
<li>Naye site ka runbook: network, point, register, assign, verify, deliver, record.</li>
</ul></div>
`}};export{e as default};