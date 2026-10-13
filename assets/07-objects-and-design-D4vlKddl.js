var e={id:`objects-design`,h:{en:`Objects, groups and a policy design that stays clean`,hi:`Objects, groups aur policy design jo saaf rahe`},body:{en:`
<p>A rulebase with hundreds of raw IP addresses is a rulebase nobody dares to touch. PAN-OS lets you give names to addresses, groups of addresses and services, so rules read like English and a change in one place updates every rule that uses it. Think of a phone book: you write "call Admin" and not the digits.</p>
<h3>The building blocks</h3>
<table class="cmp"><tr><th>Object</th><th>Holds</th><th>Example</th></tr><tr><td><code>address</code></td><td>one host, a subnet (<code>ip-netmask</code>), a range or a fully qualified name (<code>fqdn</code>)</td><td>ADMIN-PC = 10.0.1.50/32</td></tr><tr><td><code>address-group</code></td><td>a static list of addresses or groups</td><td>ADMIN-SET</td></tr><tr><td><code>service</code></td><td>a protocol and port, or a range</td><td>tcp-8081</td></tr><tr><td><code>tag</code></td><td>a label to colour and filter rules</td><td>legacy, review</td></tr></table>
<p>The lab already holds two address objects (ADMIN-PC and JUMP-SRV). Create a group, a service object and a final logging deny rule, then look at each as it will be stored:</p>
<pre class="out"><span class="hl">admin@NK-PUNE-PA# set address-group ADMIN-SET static [ ADMIN-PC JUMP-SRV ]</span>
[edit]
<span class="hl">admin@NK-PUNE-PA# set service tcp-8081 protocol tcp port 8081</span>
[edit]
<span class="hl">admin@NK-PUNE-PA# set rulebase security rules Deny-All-Log from any to any source any destination any application any service any action deny log-end yes</span>
[edit]
admin@NK-PUNE-PA# show address
address {
  ADMIN-PC {
    ip-netmask 10.0.1.50/32;
  }
  JUMP-SRV {
    ip-netmask 8.8.8.8/32;
  }
}

[edit]
admin@NK-PUNE-PA# show address-group
address-group {
<span class="hl">  ADMIN-SET {</span>
    static [ ADMIN-PC JUMP-SRV ];
  }
}

[edit]
admin@NK-PUNE-PA# show service
service {
<span class="hl">  tcp-8081 {</span>
    protocol {
      tcp {
        port 8081;
      }
    }
  }
}

[edit]
<span class="hl">admin@NK-PUNE-PA# show rulebase security rules Deny-All-Log</span>
<span class="hl">Deny-All-Log {</span>
  from any;
  to any;
  source any;
  destination any;
  application any;
  service any;
  action deny;
  log-end yes;
}

[edit]
admin@NK-PUNE-PA# commit
Commit job 4 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<p>Now the whole rulebase in order, as the firewall runs it. The last rule is the explicit deny with logging, which sits <b>below</b> every allow:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
"Admin-SSH; index: 1" {
        application/service ssh/application-default;
        action allow;
"Block-SSH; index: 2" {
        application/service ssh/any;
        action deny;
"Allow-Out; index: 3" {
        application/service [ ping dns web-browsing ssl ]/application-default;
        action allow;
<span class="hl">"Deny-All-Log; index: 4" {</span>
        application/service any/any;
        action deny;</pre>
<p>Test the 8081 traffic from the previous chapter against it. The final rule now catches it, and because it logs, the SOC sees it:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 8081
<span class="hl">"Deny-All-Log; index: 4" {</span>
        application/service any/any;
        action deny;</pre>
<h3>Design habits that pay off</h3>
<ol><li><b>Name by purpose.</b> <code>Allow-Out</code>, <code>DMZ-Web-In</code>, <code>Admin-SSH</code> tell a story; <code>rule14</code> does not.</li><li><b>Use groups for sets of hosts</b> so a new admin PC is one change, not twenty.</li><li><b>Be narrow in zones first</b> (specific from and to), then addresses, then applications.</li><li><b>Order by specificity</b>: exceptions, business allows, blocks, cleanup rule with logging.</li><li><b>Document with description and tags</b> and review rules that have not matched anything for months.</li><li><b>Move from port-based to application-based</b> in steps: log what the old broad rule really carries, create application rules, then remove the broad rule.</li></ol>
<div class="note"><p><b>Reference only (not run in the simulator).</b> To find unused rules on a real firewall you use the rule hit counters: <code>show rule-hit-count vsys vsys-name vsys1 rule-base security rules all</code> in operational mode, or the policy optimizer in the web interface. The simulator does not keep per-rule hit counters, so there is no output to show; use <code>show log traffic</code> in the lab instead.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using <code>any</code> in source, destination <b>and</b> application on an allow rule. The rule becomes a hole. If you must, restrict the zones and keep logging on.</p></div>
<div class="exam"><p><b>Exam trap.</b> A service object holds ports; an address object holds IPs; a rule can use both. Remember that address objects used in a rule must exist at commit time, or the commit fails with a validation error.</p></div>
<div class="scn"><h4>One new admin laptop, twenty rules</h4><p>A company had 20 rules that each listed the admin laptops by IP address. A new laptop meant 20 edits and one was always forgotten. The engineer created the group <code>ADMIN-SET</code>, replaced the addresses in all rules with the group and added the new laptop once. Later changes took a minute.</p><p><b>Lesson:</b> groups turn a repeated edit into a single edit.</p></div>
<div class="iv"><p class="q">"How do you keep a large Palo Alto rulebase maintainable?"</p><p>I use meaningful rule names, address and service objects and groups instead of raw values, tags and descriptions, a consistent order from specific to general, and a final explicit deny that logs. I review rules that have not been hit, and I migrate port-based rules to application-based ones in steps using the logs.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Objects and groups make rules readable and changes cheap.</li><li>Put a logging deny at the bottom so blocked traffic is visible.</li><li>Narrow zones first, then addresses, then applications.</li><li>Migrate port-based rules to application-based rules in steps.</li></ul></div>
`,hi:`
<p>Jis rulebase mein sainkdon raw IP addresses hon use koi chhoone ki himmat nahi karta. PAN-OS addresses, addresses ke groups aur services ko naam dene deta hai, isliye rules angrezi ki tarah padhi jaati hain aur ek jagah ka badlav har us rule ko update kar deta hai jo use use karti hai. Phone book socho: aap "Admin ko call karo" likhte ho, number nahi.</p>
<h3>Building blocks</h3>
<table class="cmp"><tr><th>Object</th><th>Kya rakhta hai</th><th>Example</th></tr><tr><td><code>address</code></td><td>ek host, subnet (<code>ip-netmask</code>), range ya fully qualified name (<code>fqdn</code>)</td><td>ADMIN-PC = 10.0.1.50/32</td></tr><tr><td><code>address-group</code></td><td>addresses ya groups ki static list</td><td>ADMIN-SET</td></tr><tr><td><code>service</code></td><td>ek protocol aur port, ya range</td><td>tcp-8081</td></tr><tr><td><code>tag</code></td><td>rules ko rang dene aur filter karne ka label</td><td>legacy, review</td></tr></table>
<p>Lab mein pehle se do address objects hain (ADMIN-PC aur JUMP-SRV). Ek group, ek service object aur aakhri logging deny rule banao, phir har ek ko dekho jaise store hoga:</p>
<pre class="out"><span class="hl">admin@NK-PUNE-PA# set address-group ADMIN-SET static [ ADMIN-PC JUMP-SRV ]</span>
[edit]
<span class="hl">admin@NK-PUNE-PA# set service tcp-8081 protocol tcp port 8081</span>
[edit]
<span class="hl">admin@NK-PUNE-PA# set rulebase security rules Deny-All-Log from any to any source any destination any application any service any action deny log-end yes</span>
[edit]
admin@NK-PUNE-PA# show address
address {
  ADMIN-PC {
    ip-netmask 10.0.1.50/32;
  }
  JUMP-SRV {
    ip-netmask 8.8.8.8/32;
  }
}

[edit]
admin@NK-PUNE-PA# show address-group
address-group {
<span class="hl">  ADMIN-SET {</span>
    static [ ADMIN-PC JUMP-SRV ];
  }
}

[edit]
admin@NK-PUNE-PA# show service
service {
<span class="hl">  tcp-8081 {</span>
    protocol {
      tcp {
        port 8081;
      }
    }
  }
}

[edit]
<span class="hl">admin@NK-PUNE-PA# show rulebase security rules Deny-All-Log</span>
<span class="hl">Deny-All-Log {</span>
  from any;
  to any;
  source any;
  destination any;
  application any;
  service any;
  action deny;
  log-end yes;
}

[edit]
admin@NK-PUNE-PA# commit
Commit job 4 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<p>Ab poora rulebase order mein, jaise firewall chalata hai. Aakhri rule logging ke saath explicit deny hai, jo har allow ke <b>neeche</b> baithti hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
"Admin-SSH; index: 1" {
        application/service ssh/application-default;
        action allow;
"Block-SSH; index: 2" {
        application/service ssh/any;
        action deny;
"Allow-Out; index: 3" {
        application/service [ ping dns web-browsing ssl ]/application-default;
        action allow;
<span class="hl">"Deny-All-Log; index: 4" {</span>
        application/service any/any;
        action deny;</pre>
<p>Pichhle chapter ke 8081 traffic ko ab isse test karo. Aakhri rule use pakadti hai, aur kyunki yeh log karti hai, SOC ko dikhta hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 8081
<span class="hl">"Deny-All-Log; index: 4" {</span>
        application/service any/any;
        action deny;</pre>
<h3>Design habits jo kaam aati hain</h3>
<ol><li><b>Purpose se naam do.</b> <code>Allow-Out</code>, <code>DMZ-Web-In</code>, <code>Admin-SSH</code> kahani batate hain; <code>rule14</code> nahi.</li><li><b>Hosts ke sets ke liye groups use karo</b> taaki naya admin PC ek change ho, bees nahi.</li><li><b>Pehle zones mein narrow raho</b> (specific from aur to), phir addresses, phir applications.</li><li><b>Specificity se order karo</b>: exceptions, business allows, blocks, logging wali cleanup rule.</li><li><b>Description aur tags se document karo</b> aur woh rules review karo jo mahino se kuch match nahi hui.</li><li><b>Port-based se application-based par steps mein jao</b>: dekho purani broad rule asal mein kya le jaati hai, application rules banao, phir broad rule hatao.</li></ol>
<div class="note"><p><b>Sirf reference (simulator mein run nahi).</b> Asli firewall par unused rules dhoondne ke liye rule hit counters use hote hain: operational mode mein <code>show rule-hit-count vsys vsys-name vsys1 rule-base security rules all</code>, ya web interface ka policy optimizer. Simulator per-rule hit counters nahi rakhta, isliye dikhane ke liye output nahi hai; lab mein uske badle <code>show log traffic</code> use karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Allow rule par source, destination <b>aur</b> application mein <code>any</code> use karna. Rule ek chhed ban jaati hai. Karna hi pade to zones restrict karo aur logging on rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Service object ports rakhta hai; address object IPs; rule dono use kar sakti hai. Yaad rakho ki rule mein use hue address objects commit ke samay maujood hone chahiye, nahi to commit validation error se fail hota hai.</p></div>
<div class="scn"><h4>Ek naya admin laptop, bees rules</h4><p>Ek company ki 20 rules mein se har ek admin laptops ko IP address se list karti thi. Naye laptop ka matlab 20 edits aur ek hamesha chhoot jaata tha. Engineer ne group <code>ADMIN-SET</code> banaya, saari rules ke addresses group se badal diye aur naya laptop ek baar jodha. Baad ke changes ek minute mein hone lage.</p><p><b>Lesson:</b> groups baar-baar ke edit ko ek edit bana dete hain.</p></div>
<div class="iv"><p class="q">"Bade Palo Alto rulebase ko maintainable kaise rakhte ho?"</p><p>Main meaningful rule names, raw values ki jagah address aur service objects aur groups, tags aur descriptions, specific se general tak consistent order, aur log karne wala aakhri explicit deny use karta hoon. Jo rules hit nahi hui unhe review karta hoon, aur logs ki madad se port-based rules ko steps mein application-based mein badalta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Objects aur groups rules ko readable aur changes ko sasta banate hain.</li><li>Neeche logging deny rakho taaki blocked traffic dikhe.</li><li>Pehle zones narrow karo, phir addresses, phir applications.</li><li>Port-based rules ko steps mein application-based rules mein badlo.</li></ul></div>
`}};export{e as default};