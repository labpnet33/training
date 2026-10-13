var e={id:`policies`,h:{en:`Firewall policies: create, order and clean up`,hi:`Firewall policies: banao, order lagao aur safai karo`},body:{en:`
<p>An address object is harmless until a policy uses it. A policy is where a mistake can cut traffic or open a hole, so this chapter slows down. It is Lab 1, step 4: one policy for CHG-3105, then the ordering trick with a temporary second policy.</p>

<h3>An analogy: the bouncer's list</h3>
<p>A firewall policy table is the bouncer's list at a club door. The bouncer reads it <b>from the top</b> and the first line that matches decides; if no line matches, the implicit deny at the bottom turns the guest away. A new line written at the bottom can be useless if a broader line above it already decides. Order is part of the rule.</p>

<h3>The policy as data</h3>
<p>The policy is a Python dictionary. Interfaces, addresses and services are <b>lists of dictionaries with a name</b>, the format you saw in chapter 5:</p>
<pre class="code">from fgt import ensure, session

POLICY = {
    "name": "lan-to-web",
    "srcintf": [{"name": "port2"}], "dstintf": [{"name": "port1"}],
    "srcaddr": [{"name": "all"}], "dstaddr": [{"name": "WEB-SERVERS"}],
    "action": "accept", "schedule": "always", "service": [{"name": "HT&#84;PS"}],
    "nat": "enable", "logtraffic": "all", "comments": "CHG-3105",
}

action, policyid = ensure(session(), "firewall/policy", POLICY)
print("policy   %-12s %s, policyid %s" % (POLICY["name"], action, policyid))</pre>
<pre class="out">AUTO01$ python3 policy.py
<span class="hl">policy   lan-to-web   created, policyid 1</span>
AUTO01$ python3 policy.py
<span class="hl">policy   lan-to-web   unchanged, policyid 1</span></pre>
<p>The first run says <code>created, policyid 1</code>. The firewall chooses the number; your script finds the policy by its <b>name</b> through the same <code>ensure()</code>, and the second run says <code>unchanged</code>. Check the result in the CLI:</p>
<pre class="out">FGT1 # show firewall policy
config firewall policy
    edit 1
        set name "lan-to-web"
        set uuid 212226df-f762-5181-874e-e9b862197b2e
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
<span class="hl">        set dstaddr "WEB-SERVERS"</span>
        set schedule "always"
<span class="hl">        set service "HT&#84;PS"</span>
<span class="hl">        set logtraffic all</span>
<span class="hl">        set nat enable</span>
        set comments "CHG-3105"
    next
end</pre>
<p>Every field of the dictionary appears as a <code>set</code> line. Note <code>logtraffic all</code> (log every session; without it you cannot prove later who used the rule) and <code>nat enable</code> (use the exit interface address for outbound traffic).</p>

<h3>Order: where does the new rule land?</h3>
<p>A new policy is added at the bottom. To put it above another one you do not delete and re-create; you ask FortiOS to move it with a PUT and two query parameters, <code>action=move</code> and <code>before=</code> (or <code>after=</code>) the id of the other policy. <code>order.py</code> proves it with a throw-away deny rule for telnet:</p>
<pre class="code">from fgt import call, ensure, session

s = session()
BLOCK = {
    "name": "block-telnet",
    "srcintf": [{"name": "port2"}], "dstintf": [{"name": "port1"}],
    "srcaddr": [{"name": "all"}], "dstaddr": [{"name": "WEB-SERVERS"}],
    "action": "deny", "schedule": "always", "service": [{"name": "TELNET"}],
    "logtraffic": "all", "comments": "CHG-3105",
}


def show(label):
    rows = call(s, "GET", "/cmdb/firewall/policy", params={"format": "policyid|name|action"})["results"]
    print(label, [(r["policyid"], r["name"], r["action"]) for r in rows])


action, policyid = ensure(s, "firewall/policy", BLOCK)
print("block-telnet:", action, "as policyid", policyid)
show("after create:")
call(s, "PUT", "/cmdb/firewall/policy/2", params={"action": "move", "before": 1})
show("after move:  ")
call(s, "DELETE", "/cmdb/firewall/policy/2")
show("after delete:")</pre>
<pre class="out">AUTO01$ python3 order.py
<span class="hl">block-telnet: created as policyid 2</span>
after create: [(1, 'lan-to-web', 'accept'), (2, 'block-telnet', 'deny')]
<span class="hl">after move:   [(2, 'block-telnet', 'deny'), (1, 'lan-to-web', 'accept')]</span>
<span class="hl">after delete: [(1, 'lan-to-web', 'accept')]</span></pre>
<p>Read the three lines of output as a story. After the create, <code>block-telnet</code> got id 2 and sits below <code>lan-to-web</code>. After the move it sits first, even though its id is still 2. After the delete only the lab policy remains. Remember the lesson: <b>the id is a name tag, the position is the logic</b>. The list returned by the API is in evaluation order, so print it before and after every move.</p>

<div class="eg"><p><b>Worked example: the deny that never fires.</b> The ticket says "block telnet from the lan to the web servers". An engineer creates the deny rule through the API and tests it. Telnet still works. The cause is exactly the first line of the order output: the accept rule <code>lan-to-web</code> is above the new deny and matches first. The fix is the single PUT with <code>action=move&amp;before=1</code>, not a new rule. The check is to read the order back, not to trust the success message.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab FortiGate accepts two policies with the same <b>name</b>. A real FortiOS rejects a duplicate policy name (error number is table-specific), which is another reason to find by name first. On real gear also expect required fields the lab does not insist on, such as a security profile mode or <code>inspection-mode</code> on newer versions, and 500 errors for values that are not valid on that model. The REST call only checks what the CLI would check.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating the policy and forgetting the position. Using <code>"service": "HT&#84;PS"</code> (a string) instead of <code>[{"name": "HT&#84;PS"}]</code> (a list). Using <code>srcaddr: all</code> with <code>action: accept</code> "to test". Testing a new rule in production without <code>logtraffic</code>. Deleting by policy id taken from an old note: ids can be reused after a delete.</p></div>
<div class="exam"><p><b>Exam trap.</b> The policy id is not the position. Two exam favourites: (1) a policy created through the API lands at the bottom, (2) moving uses <code>PUT</code> on the policy with <code>action=move</code>, not a new POST. And, as always for this module, the change is live as soon as the reply returns.</p></div>

<div class="scn"><h4>Safe order of work for a risky rule</h4><p>The security team wants a new deny above a broad accept. The safe sequence the team now uses: (1) read the current order and save it in the ticket, (2) <code>ensure()</code> the deny, (3) move it with a PUT, (4) read the order back and compare, (5) read <code>hit_count</code> after a test connection, (6) if wrong, move it back. The whole thing is a script with a read at both ends, because a REST write has no "oops" button.</p><p><b>Lesson:</b> with no commit and no rollback, the script itself must contain the before and after.</p></div>

<div class="iv"><p class="q">"How do you change the order of firewall policies through the FortiOS API?"</p><p>A PUT on the policy with <code>action=move</code> and either <code>before</code> or <code>after</code> set to the id of the neighbour. New policies are appended at the end. I always read the list back, because it is returned in evaluation order, and I confirm with the policy hit counters from the monitor area.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies are lists of dictionaries with names; find them by name with ensure(), the id is assigned by the firewall.</li>
<li>First match wins: a new policy lands at the bottom, use <code>PUT ... ?action=move&amp;before=ID</code> to place it.</li>
<li>Read the policy list before and after every move; the list is in evaluation order.</li>
<li>Set <code>logtraffic</code> and a ticket comment on every policy.</li>
<li>Writes are live: put reads at both ends of the script.</li>
</ul></div>
`,hi:`
<p>Address object tab tak harmless hai jab tak koi policy use na kare. Policy woh jagah hai jahan galti traffic kaat sakti hai ya chhed khol sakti hai, isliye yeh chapter dheere chalta hai. Yeh Lab 1, step 4 hai: CHG-3105 ki ek policy, phir ek temporary doosri policy ke saath ordering ka trick.</p>

<h3>Ek analogy: bouncer ki list</h3>
<p>Firewall policy table club ke darwaze par bouncer ki list hai. Bouncer use <b>upar se</b> padhta hai aur pehli matching line faisla karti hai; koi line match na kare to neeche ka implicit deny mehmaan ko lauta deta hai. Neeche likhi nayi line bekaar ho sakti hai agar upar ki badi line pehle hi faisla kar deti hai. Order niyam ka hissa hai.</p>

<h3>Policy data ki tarah</h3>
<p>Policy Python dictionary hai. Interfaces, addresses aur services <b>naam wali dictionaries ki lists</b> hain, wahi format jo chapter 5 mein dekha:</p>
<pre class="code">from fgt import ensure, session

POLICY = {
    "name": "lan-to-web",
    "srcintf": [{"name": "port2"}], "dstintf": [{"name": "port1"}],
    "srcaddr": [{"name": "all"}], "dstaddr": [{"name": "WEB-SERVERS"}],
    "action": "accept", "schedule": "always", "service": [{"name": "HT&#84;PS"}],
    "nat": "enable", "logtraffic": "all", "comments": "CHG-3105",
}

action, policyid = ensure(session(), "firewall/policy", POLICY)
print("policy   %-12s %s, policyid %s" % (POLICY["name"], action, policyid))</pre>
<pre class="out">AUTO01$ python3 policy.py
<span class="hl">policy   lan-to-web   created, policyid 1</span>
AUTO01$ python3 policy.py
<span class="hl">policy   lan-to-web   unchanged, policyid 1</span></pre>
<p>Pehli run kehti hai <code>created, policyid 1</code>. Number firewall chunta hai; aapki script policy ko uske <b>naam</b> se wahi <code>ensure()</code> se dhoondhti hai, aur doosri run <code>unchanged</code> kehti hai. Result CLI mein dekho:</p>
<pre class="out">FGT1 # show firewall policy
config firewall policy
    edit 1
        set name "lan-to-web"
        set uuid 212226df-f762-5181-874e-e9b862197b2e
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
<span class="hl">        set dstaddr "WEB-SERVERS"</span>
        set schedule "always"
<span class="hl">        set service "HT&#84;PS"</span>
<span class="hl">        set logtraffic all</span>
<span class="hl">        set nat enable</span>
        set comments "CHG-3105"
    next
end</pre>
<p>Dictionary ka har field ek <code>set</code> line ban kar dikhta hai. Dhyan do <code>logtraffic all</code> (har session log karo; iske bina baad mein saabit nahi kar sakte ki kisne rule use kiya) aur <code>nat enable</code> (outbound traffic ke liye exit interface address use karo).</p>

<h3>Order: nayi rule kahan baithti hai?</h3>
<p>Nayi policy neeche jud jaati hai. Use kisi doosri ke upar rakhne ke liye delete aur re-create nahi karte; FortiOS ko PUT aur do query parameters se move karne ko kehte ho, <code>action=move</code> aur doosri policy ke id ke saath <code>before=</code> (ya <code>after=</code>). <code>order.py</code> telnet ke ek throw-away deny rule se yeh saabit karti hai:</p>
<pre class="code">from fgt import call, ensure, session

s = session()
BLOCK = {
    "name": "block-telnet",
    "srcintf": [{"name": "port2"}], "dstintf": [{"name": "port1"}],
    "srcaddr": [{"name": "all"}], "dstaddr": [{"name": "WEB-SERVERS"}],
    "action": "deny", "schedule": "always", "service": [{"name": "TELNET"}],
    "logtraffic": "all", "comments": "CHG-3105",
}


def show(label):
    rows = call(s, "GET", "/cmdb/firewall/policy", params={"format": "policyid|name|action"})["results"]
    print(label, [(r["policyid"], r["name"], r["action"]) for r in rows])


action, policyid = ensure(s, "firewall/policy", BLOCK)
print("block-telnet:", action, "as policyid", policyid)
show("after create:")
call(s, "PUT", "/cmdb/firewall/policy/2", params={"action": "move", "before": 1})
show("after move:  ")
call(s, "DELETE", "/cmdb/firewall/policy/2")
show("after delete:")</pre>
<pre class="out">AUTO01$ python3 order.py
<span class="hl">block-telnet: created as policyid 2</span>
after create: [(1, 'lan-to-web', 'accept'), (2, 'block-telnet', 'deny')]
<span class="hl">after move:   [(2, 'block-telnet', 'deny'), (1, 'lan-to-web', 'accept')]</span>
<span class="hl">after delete: [(1, 'lan-to-web', 'accept')]</span></pre>
<p>Output ki teen lines ko kahani ki tarah padho. Create ke baad <code>block-telnet</code> ko id 2 mila aur woh <code>lan-to-web</code> ke neeche hai. Move ke baad woh pehle hai, jabki id abhi bhi 2 hai. Delete ke baad sirf lab policy bachi hai. Lesson yaad rakho: <b>id naam ka tag hai, position logic hai</b>. API ki lautai list evaluation order mein hoti hai, isliye har move se pehle aur baad print karo.</p>

<div class="eg"><p><b>Worked example: woh deny jo kabhi fire nahi hua.</b> Ticket kehta hai "lan se web servers tak telnet block karo". Engineer API se deny rule banata hai aur test karta hai. Telnet phir bhi chalta hai. Wajah order output ki pehli line hai: accept rule <code>lan-to-web</code> naye deny ke upar hai aur pehle match karta hai. Fix ek hi PUT hai <code>action=move&amp;before=1</code> ke saath, nayi rule nahi. Check order wapas padhna hai, success message par bharosa nahi.</p></div>

<div class="note"><p><b>Lab vs asli gear.</b> Lab FortiGate ek hi <b>naam</b> ki do policies le leta hai. Asli FortiOS duplicate policy name reject karta hai (error number table-specific hai), jo pehle naam se find karne ki ek aur wajah hai. Asli gear par woh required fields bhi expect karo jinka lab agrah nahi karta, jaise newer versions mein security profile mode ya <code>inspection-mode</code>, aur us model par invalid values ke liye 500 errors. REST call sirf wahi check karta hai jo CLI karta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Policy bana kar position bhool jaana. <code>[{"name": "HT&#84;PS"}]</code> (list) ki jagah <code>"service": "HT&#84;PS"</code> (string) likhna. "Test ke liye" <code>srcaddr: all</code> ke saath <code>action: accept</code>. Production mein nayi rule bina <code>logtraffic</code> ke test karna. Purane note se liye policy id se delete karna: delete ke baad ids dobara use ho sakte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy id position nahi hai. Do exam favourites: (1) API se bani policy neeche aati hai, (2) move ke liye policy par <code>PUT</code> aur <code>action=move</code> use hota hai, nayi POST nahi. Aur is module ki tarah yahan bhi, reply aate hi change live hai.</p></div>

<div class="scn"><h4>Risky rule ke liye kaam ka safe order</h4><p>Security team ek badi accept ke upar nayi deny chahti hai. Team ab yeh safe sequence use karti hai: (1) maujooda order padho aur ticket mein rakho, (2) deny ko <code>ensure()</code> karo, (3) PUT se move karo, (4) order wapas padho aur compare karo, (5) test connection ke baad <code>hit_count</code> padho, (6) galat ho to wapas move karo. Poori cheez ek script hai jisme dono sire par read hai, kyunki REST write ka koi "oops" button nahi hota.</p><p><b>Lesson:</b> commit aur rollback na ho to script ke andar hi before aur after hona chahiye.</p></div>

<div class="iv"><p class="q">"FortiOS API se firewall policies ka order kaise badalte ho?"</p><p>Policy par PUT, <code>action=move</code> aur padosi ke id par set <code>before</code> ya <code>after</code> ke saath. Nayi policies end mein judti hain. Main list hamesha wapas padhta hoon kyunki woh evaluation order mein aati hai, aur monitor area ke policy hit counters se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies naam wali dictionaries ki lists hain; ensure() se naam ke saath dhoondho, id firewall deta hai.</li>
<li>First match jeetta hai: nayi policy neeche aati hai, rakhne ke liye <code>PUT ... ?action=move&amp;before=ID</code> use karo.</li>
<li>Har move se pehle aur baad policy list padho; list evaluation order mein hai.</li>
<li>Har policy par <code>logtraffic</code> aur ticket comment lagao.</li>
<li>Writes live hain: script ke dono sire par reads rakho.</li>
</ul></div>
`}};export{e as default};