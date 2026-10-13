var e={id:`pushing-and-effective-config`,h:{en:`Pushing templates and reading what the firewall shows`,hi:`Templates push karna aur firewall jo dikhata hai wo padhna`},body:{en:`
<p>Writing a letter is not the same as posting it, and posting it is not the same as the neighbour reading it. Template work has the same three stages: you <b>edit</b> in the candidate configuration, you <b>commit</b> on Panorama so the letter is final, and you <b>push</b> so it is delivered. Each stage has its own proof.</p>

<h3>The rule that explains most confusion</h3>
<p>A push always sends Panorama's last <b>committed</b> (running) configuration, never the candidate. If you edit a template and push without committing, the firewalls receive the old version. After a commit and before a push, the inventory shows Out of Sync. Learn this sentence by heart; it solves half of all "I changed it but nothing happened" tickets.</p>

<h3>The push command</h3>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK
PANO&gt; commit-all template-stack name NK-STACK validate-only yes
PANO&gt; commit-all template-stack name NK-STACK device &lt;serial&gt;
PANO&gt; commit-all template-stack name NK-STACK force-template-values yes</pre>
<p>Options in the lab: <code>validate-only</code> runs the same checks but changes nothing and records a Validate job; <code>device</code> limits the push to one firewall; <code>force-template-values</code> is covered in chapter 9; <code>merge-with-candidate-cfg</code> decides whether pending local changes on the firewall are committed together with the push. Defaults are not the same in every product version, so state the options explicitly in practice, and check the documentation for your PAN-OS version.</p>

<h3>Each firewall is validated on its own</h3>
<p>The results come back per firewall. One can succeed while another fails, and the failing firewall keeps its previous configuration. The final line says "completed with errors". Always read every line, not only the last.</p>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK

Job enqueued with jobid 3

Serial            Hostname          Result
0079185321121     NK-PUNE-PA        commit succeeded (template stack NK-STACK)
0079134988264     NK-DELHI-PA       commit succeeded (template stack NK-STACK)
0079151765883     NK-CHENNAI-PA     commit failed: template NK-STACK: variable $lan-ip has no value for this firewall (set it on the template stack or on the stack device entry)

Push to template-stack NK-STACK completed with errors</pre>

<h3>What the firewall shows: pushed-template and running</h3>
<p>Two commands answer different questions. <code>show config pushed-template</code> displays what Panorama sent, with variables already resolved to real values. <code>show config running</code> displays the firewall's merged, effective configuration, which can include local values. If both agree, the template is in force. If they differ, something local is overriding it (chapter 9).</p>
<pre class="code">NK-PUNE-PA&gt; show config pushed-template
network {
  interface {
    ethernet {
      ethernet1/1 {
        layer3 {
          ip 203.0.113.2/30;
          interface-management-profile allow-ping;
        }
      }
      ethernet1/2 {
        layer3 {
          ip 10.1.1.1/24;
          interface-management-profile mgmt-lan;
        }
      }
    }
  }
...</pre>
<p>Also check the other signals: <code>show devices all</code> on Panorama shows In Sync or Out of Sync under Template, <code>show interface all</code> on the firewall shows the interface, zone and address, and <code>show jobs all</code> lists Commit, CommitAll and Validate jobs.</p>

<table class="tbl"><thead><tr><th>Question</th><th>Command</th><th>On</th></tr></thead><tbody>
<tr><td>Is the firewall current?</td><td>show devices all</td><td>Panorama</td></tr>
<tr><td>What was sent?</td><td>show config pushed-template</td><td>Firewall</td></tr>
<tr><td>What is really configured?</td><td>show config running</td><td>Firewall</td></tr>
<tr><td>Did the interface come up?</td><td>show interface all</td><td>Firewall</td></tr>
<tr><td>Did the push run?</td><td>show jobs all</td><td>Both</td></tr>
</tbody></table>

<div class="scn"><h4>Edited but not committed</h4><p>An engineer changed a DNS value in a template at the end of a shift and pushed straight away. The inventory said In Sync and nothing changed. The firewalls had received the previous commit. The next morning a colleague committed first, pushed, and compared pushed-template against running to prove the new value was in force.</p></div>

<div class="iv"><p class="q">"You pushed a template and the firewall did not change. What do you check first?"</p><p>Whether the change was committed on Panorama, because a push sends the committed configuration. Then the per-firewall result lines of the push, the Template sync state in the inventory, and finally pushed-template versus running on the firewall to see whether a local value overrides it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edit, commit, push are three separate steps; push sends committed config only.</li>
<li>Results are per firewall; read every line, the failing firewall keeps its old config.</li>
<li>pushed-template shows what was sent; running shows what is effective.</li>
<li>validate-only gives a safe dry run and a Validate job.</li>
</ul></div>
`,hi:`
<p>Khat likhna aur use post karna ek nahi hai, aur post karna aur padosi ka padhna bhi ek nahi hai. Template ke kaam mein bhi yehi teen stages hain: candidate configuration mein <b>edit</b> karte ho, Panorama par <b>commit</b> karte ho taaki khat final ho, aur <b>push</b> karte ho taaki deliver ho. Har stage ka apna proof hota hai.</p>

<h3>Wo rule jo zyada tar confusion samjhata hai</h3>
<p>Push hamesha Panorama ki aakhri <b>committed</b> (running) configuration bhejta hai, candidate kabhi nahi. Template edit karke bina commit ke push karo to firewalls ko purana version milta hai. Commit ke baad aur push se pehle inventory Out of Sync dikhata hai. Ye vaakya ratt lo; ye "maine badla par kuch nahi hua" ke aadhe tickets solve karta hai.</p>

<h3>Push command</h3>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK
PANO&gt; commit-all template-stack name NK-STACK validate-only yes
PANO&gt; commit-all template-stack name NK-STACK device &lt;serial&gt;
PANO&gt; commit-all template-stack name NK-STACK force-template-values yes</pre>
<p>Lab ke options: <code>validate-only</code> wahi checks chalata hai par kuch badalta nahi aur Validate job record karta hai; <code>device</code> push ko ek firewall tak seemit karta hai; <code>force-template-values</code> chapter 9 mein hai; <code>merge-with-candidate-cfg</code> decide karta hai ki firewall ke pending local changes push ke saath commit honge ya nahi. Defaults har product version mein same nahi hote, isliye practice mein options explicitly likho, aur apne PAN-OS version ki documentation check karo.</p>

<h3>Har firewall alag validate hota hai</h3>
<p>Results har firewall ke hisaab se aate hain. Ek succeed kar sakta hai jabki doosra fail ho, aur failing firewall apni purani configuration rakhta hai. Aakhri line "completed with errors" kehti hai. Hamesha har line padho, sirf aakhri nahi.</p>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK

Job enqueued with jobid 3

Serial            Hostname          Result
0079185321121     NK-PUNE-PA        commit succeeded (template stack NK-STACK)
0079134988264     NK-DELHI-PA       commit succeeded (template stack NK-STACK)
0079151765883     NK-CHENNAI-PA     commit failed: template NK-STACK: variable $lan-ip has no value for this firewall (set it on the template stack or on the stack device entry)

Push to template-stack NK-STACK completed with errors</pre>

<h3>Firewall kya dikhata hai: pushed-template aur running</h3>
<p>Do commands alag sawalon ka jawab dete hain. <code>show config pushed-template</code> wo dikhata hai jo Panorama ne bheja, variables real values mein resolve hokar. <code>show config running</code> firewall ki merged, effective configuration dikhata hai, jisme local values bhi ho sakti hain. Dono match karein to template force mein hai. Alag hon to koi local cheez override kar rahi hai (chapter 9).</p>
<pre class="code">NK-PUNE-PA&gt; show config pushed-template
network {
  interface {
    ethernet {
      ethernet1/1 {
        layer3 {
          ip 203.0.113.2/30;
          interface-management-profile allow-ping;
        }
      }
      ethernet1/2 {
        layer3 {
          ip 10.1.1.1/24;
          interface-management-profile mgmt-lan;
        }
      }
    }
  }
...</pre>
<p>Doosre signals bhi dekho: Panorama par <code>show devices all</code> Template ke neeche In Sync ya Out of Sync dikhata hai, firewall par <code>show interface all</code> interface, zone aur address dikhata hai, aur <code>show jobs all</code> Commit, CommitAll aur Validate jobs list karta hai.</p>

<table class="tbl"><thead><tr><th>Sawal</th><th>Command</th><th>Kahan</th></tr></thead><tbody>
<tr><td>Firewall current hai?</td><td>show devices all</td><td>Panorama</td></tr>
<tr><td>Kya bheja gaya?</td><td>show config pushed-template</td><td>Firewall</td></tr>
<tr><td>Asal mein kya configured hai?</td><td>show config running</td><td>Firewall</td></tr>
<tr><td>Interface up aaya?</td><td>show interface all</td><td>Firewall</td></tr>
<tr><td>Push chala?</td><td>show jobs all</td><td>Dono</td></tr>
</tbody></table>

<div class="scn"><h4>Edit kiya par commit nahi</h4><p>Ek engineer ne shift ke ant mein template mein DNS value badli aur seedha push kar diya. Inventory ne In Sync kaha aur kuch nahi badla. Firewalls ko pichhla commit mila tha. Agli subah colleague ne pehle commit kiya, push kiya, aur pushed-template ko running se compare karke prove kiya ki nayi value force mein hai.</p></div>

<div class="iv"><p class="q">"Tumne template push kiya aur firewall nahi badla. Pehle kya check karoge?"</p><p>Pehle ye ki change Panorama par commit hua ya nahi, kyunki push committed configuration bhejta hai. Phir push ki per-firewall result lines, inventory mein Template sync state, aur aakhir mein firewall par pushed-template versus running ki koi local value override to nahi kar rahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edit, commit, push teen alag steps hain; push sirf committed config bhejta hai.</li>
<li>Results per firewall hain; har line padho, failing firewall purani config rakhta hai.</li>
<li>pushed-template wo dikhata hai jo bheja gaya; running wo jo effective hai.</li>
<li>validate-only safe dry run aur Validate job deta hai.</li>
</ul></div>
`}};export{e as default};