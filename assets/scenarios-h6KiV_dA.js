var e=[{title:{en:`The block that does nothing`,hi:`Wo block jo kuch nahi karta`},ticket:{en:`A company-wide ban on Telnet was pushed, yet a Pune user still reaches an external Telnet server. The security team suspects a Panorama bug.`,hi:`Company-wide Telnet ban push hua, phir bhi Pune ka user external Telnet server tak pahunch jata hai. Security team ko Panorama bug ka shak hai.`},out:`admin@NK-PUNE-PA> show running security-policy
"Allow-Out-Broad; index: 1" {
        from trust;
        to untrust;
        application/service any/any;
        action allow;
}

"Block-Telnet-Out; index: 2" {
        from any;
        to any;
        application/service telnet/application-default;
        action deny;
}`,q:{en:`What explains the result?`,hi:`Result ka kya explanation hai?`},o:[{en:`Panorama did not push the block rule`,hi:`Panorama ne block rule push nahi ki`},{en:`A broader allow sits above the block, so it matches first and the block is shadowed`,hi:`Broader allow block ke upar hai, to wahi pehle match karti hai aur block shadowed hai`},{en:`The default rules override everything`,hi:`Default rules sab override kar deti hain`},{en:`Post-rules always win over pre-rules`,hi:`Post-rules hamesha pre-rules par jeetti hain`}],a:1,w:{en:`First match wins. Allow-Out-Broad at index 1 matches the Telnet flow before index 2 is consulted. Move the block above the allow (a pre-rule in a higher level) or narrow the allow, then verify with test security-policy-match.`,hi:`Pehli match jeetti hai. Index 1 ki Allow-Out-Broad Telnet flow ko index 2 dekhne se pehle match kar leti hai. Block ko allow ke upar le jao (upar ke level ki pre-rule) ya allow narrow karo, phir test security-policy-match se verify karo.`}},{title:{en:`Push completed with errors`,hi:`Push completed with errors`},ticket:{en:`A new device group rule Allow-DNS was pushed to the branch group. Pune succeeded but Delhi did not. The Delhi site team says it never touched Panorama.`,hi:`Branch group ko nayi device group rule Allow-DNS push hui. Pune succeed hua par Delhi nahi. Delhi site team kehti hai usne Panorama ko kabhi chhua nahi.`},out:`admin@NK-PANORAMA> commit-all shared-policy device-group NK-BRANCHES include-template no
Job enqueued with jobid 7
Serial            Hostname          Result
0079185321121     NK-PUNE-PA        commit succeeded (device group NK-BRANCHES)
0079134988264     NK-DELHI-PA       commit failed: rule name Allow-DNS clashes with a local rule
Push to device group NK-BRANCHES completed with errors`,q:{en:`What is the right fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Rename the central rule (or the local one) so names are unique, then push again`,hi:`Central rule (ya local) ka naam badlo taaki names unique hon, phir dobara push karo`},{en:`Reboot the Delhi firewall`,hi:`Delhi firewall reboot karo`},{en:`Add a target negate on the rule for Pune`,hi:`Rule par Pune ke liye target negate lagao`},{en:`Delete the Pune firewall from the group`,hi:`Pune firewall ko group se hata do`}],a:0,w:{en:`Rule names must be unique across pushed and local rules, so the push to Delhi fails while Pune succeeds. A rename fixes it without touching either site's intent. Use an origin prefix convention to prevent repeats.`,hi:`Rule names pushed aur local rules ke beech unique hone chahiye, isliye Delhi ka push fail hota hai jabki Pune succeed. Rename se dono sites ka intent chhue bina fix ho jata hai. Dobara na ho isliye origin prefix convention use karo.`}},{title:{en:`Invalid zone reference`,hi:`Invalid zone reference`},ticket:{en:`A brand-new firewall was added to the branch device group and the policy push fails for it while older firewalls are fine.`,hi:`Branch device group mein bilkul naya firewall add hua aur uska policy push fail hota hai jabki purane firewalls theek hain.`},out:`admin@NK-PANORAMA> commit-all shared-policy device-group NK-BRANCHES include-template no
Job enqueued with jobid 9
Serial            Hostname          Result
0079151765883     NK-CHENNAI-PA     commit failed: rulebase -> security -> rules -> GL-Allow-Std-Out from 'trust' is not a valid reference
Push to device group NK-BRANCHES completed with errors`,q:{en:`What should you do?`,hi:`Kya karna chahiye?`},o:[{en:`Rename zone trust inside the rule`,hi:`Rule ke andar zone trust ka naam badlo`},{en:`Move the rule to Shared post`,hi:`Rule ko Shared post mein le jao`},{en:`Push the template that creates zone trust first, or push the group with the template included`,hi:`Pehle zone trust banane wala template push karo, ya template include karke group push karo`},{en:`Add a target for Chennai`,hi:`Chennai ke liye target lagao`}],a:2,w:{en:`Rules reference zones and zones come from the template. The firewall has no zone trust yet, so the rule reference is invalid. Order of operations: template first, then the device group.`,hi:`Rules zones refer karti hain aur zones template se aate hain. Firewall ke paas abhi zone trust nahi, isliye rule reference invalid hai. Order of operations: pehle template, phir device group.`}},{title:{en:`A rule that is absent in Delhi`,hi:`Wo rule jo Delhi mein absent hai`},ticket:{en:`A rule with a target was created on Panorama. The Delhi engineer cannot find it on the Delhi firewall and asks whether it is disabled.`,hi:`Panorama par target wali rule banayi gayi. Delhi engineer ko wo Delhi firewall par nahi milti aur puchta hai ki kya wo disabled hai.`},out:`admin@NK-DELHI-PA> show config pushed-shared-policy
post-rulebase {
  security {
    rules {
      BR-Deny-Rest-Log {
        from any;
        to any;
        source any;
        destination any;
        application any;
        service any;
        action deny;
      }
    }
  }
}`,q:{en:`What does the output tell you about the targeted rule?`,hi:`Output targeted rule ke baare mein kya batata hai?`},o:[{en:`It is disabled on Delhi`,hi:`Wo Delhi par disabled hai`},{en:`It is hidden because the output is truncated`,hi:`Output truncated hai isliye wo chhupi hai`},{en:`It moved to the post-rulebase`,hi:`Wo post-rulebase mein chali gayi`},{en:`It was not pushed to Delhi: Delhi is not a receiving firewall for that rule`,hi:`Wo Delhi ko push nahi hui: us rule ke liye Delhi receiving firewall nahi hai`}],a:3,w:{en:`A targeted rule is absent, not disabled, from firewalls outside its target. The pushed policy on Delhi contains only the post-rule, so the targeted pre-rule never arrived there.`,hi:`Targeted rule apne target ke bahar ke firewalls se absent hoti hai, disabled nahi. Delhi ki pushed policy mein sirf post-rule hai, to targeted pre-rule wahan kabhi pahunchi hi nahi.`}},{title:{en:`Which partner range does Chennai use?`,hi:`Chennai kaunsi partner range use karta hai?`},ticket:{en:`A Shared rule allows ping to PARTNER-NET. A colleague says Chennai must use the Shared value, but the partner is reachable only over the Chennai-specific range.`,hi:`Shared rule PARTNER-NET tak ping allow karti hai. Ek colleague kehta hai Chennai ko Shared value use karni chahiye, par partner sirf Chennai-specific range se reachable hai.`},out:`admin@NK-CHENNAI-PA> show config pushed-shared-policy
address {
  PARTNER-NET {
    ip-netmask 192.0.2.128/25;
  }
}
pre-rulebase {
  security {
    rules {
      Allow-Partner {
        destination PARTNER-NET;
        application ping;
        action allow;
      }
    }
  }
}`,q:{en:`What does Chennai resolve PARTNER-NET to, and why?`,hi:`Chennai PARTNER-NET ko kisme resolve karta hai, aur kyun?`},o:[{en:`The Shared value, because Shared always wins`,hi:`Shared value, kyunki Shared hamesha jeetta hai`},{en:`192.0.2.128/25, because its device group shadows the Shared object with the same name`,hi:`192.0.2.128/25, kyunki uska device group same naam ke Shared object ko shadow karta hai`},{en:`Both values at once`,hi:`Dono values ek saath`},{en:`No value, because the rule is in Shared`,hi:`Koi value nahi, kyunki rule Shared mein hai`}],a:1,w:{en:`A same-named object in the child device group overrides the Shared one for firewalls in that group. The rule is unchanged; only the value behind the name differs per group.`,hi:`Child device group ka same-named object us group ke firewalls ke liye Shared wale ko override karta hai. Rule nahi badli; sirf naam ke peeche ki value group ke hisaab se alag hai.`}},{title:{en:`Delhi vendor works, Pune does not`,hi:`Delhi vendor chalta hai, Pune nahi`},ticket:{en:`Outbound SSH is allowed from Delhi but denied from Pune, although both firewalls receive the same central rules. A manager asks for the reason.`,hi:`Outbound SSH Delhi se allowed hai par Pune se denied, jabki dono firewalls ko same central rules milti hain. Manager reason puchta hai.`},out:`admin@NK-DELHI-PA> show running security-policy
"Allow-Out; index: 1" { ... action allow; }
"LOC-Vendor-SSH-Out; index: 2" { ... application/service ssh/application-default; action allow; }
"BR-Deny-Rest-Log; index: 3" { ... action deny; }

admin@NK-PUNE-PA> show running security-policy
"Allow-Out; index: 1" { ... action allow; }
"BR-Deny-Rest-Log; index: 2" { ... action deny; }`,q:{en:`Why does Delhi differ?`,hi:`Delhi alag kyun hai?`},o:[{en:`Delhi has a local rule above the central post-rule deny, so SSH is allowed before the deny is reached`,hi:`Delhi ke paas central post-rule deny ke upar local rule hai, to deny tak pahunchne se pehle SSH allow ho jata hai`},{en:`Pune has a different Panorama`,hi:`Pune ka Panorama alag hai`},{en:`Post-rules apply only to Pune`,hi:`Post-rules sirf Pune par lagti hain`},{en:`Delhi ignores post-rules`,hi:`Delhi post-rules ignore karta hai`}],a:0,w:{en:`Local rules sit between pre- and post-rules. Delhi's local vendor rule is evaluated before the central catch-all deny, while Pune has no local rule, so SSH reaches the deny.`,hi:`Local rules pre- aur post-rules ke beech baithti hain. Delhi ki local vendor rule central catch-all deny se pehle evaluate hoti hai, jabki Pune ke paas local rule nahi, to SSH deny tak pahunchta hai.`}},{title:{en:`Committed but not delivered`,hi:`Commit hua par deliver nahi hua`},ticket:{en:`An engineer committed a new block rule on Panorama an hour ago, but users at Pune can still use the blocked application. He says "I committed it".`,hi:`Ek engineer ne ghanta pehle Panorama par nayi block rule commit ki, par Pune ke users abhi bhi blocked application use kar paate hain. Wo kehta hai "maine commit kiya".`},out:`admin@NK-PANORAMA> show devices all
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
0079185321121     NK-PUNE-PA        192.0.2.11      yes        NK-BRANCHES                         Out of Sync
0079134988264     NK-DELHI-PA       192.0.2.12      yes        NK-BRANCHES                         Out of Sync`,q:{en:`What is the next step?`,hi:`Agla step kya hai?`},o:[{en:`Commit again on Panorama`,hi:`Panorama par dobara commit karo`},{en:`Reboot both firewalls`,hi:`Dono firewalls reboot karo`},{en:`Change the rule to a post-rule`,hi:`Rule ko post-rule banao`},{en:`Push the device group with commit-all shared-policy, then verify on the firewall`,hi:`commit-all shared-policy se device group push karo, phir firewall par verify karo`}],a:3,w:{en:`Commit changes Panorama only. Out of Sync means the committed configuration has not been pushed. Push the group, then confirm with the running list and a policy-match test.`,hi:`Commit sirf Panorama ko badalta hai. Out of Sync ka matlab committed configuration push nahi hui. Group push karo, phir running list aur policy-match test se confirm karo.`}},{title:{en:`A rule for a firewall added later`,hi:`Baad mein add hue firewall ke liye rule`},ticket:{en:`A rule with target negate yes was meant to exclude Delhi. A new firewall joined the group next quarter and now allows something it should not.`,hi:`Target negate yes wali rule Delhi ko exclude karne ke liye thi. Agle quarter naya firewall group mein aaya aur ab wo kuch aisa allow karta hai jo nahi karna chahiye.`},out:`admin@NK-PANORAMA> show devicegroups
Group NK-BRANCHES:
    Parent: Shared
    0079185321121     NK-PUNE-PA          Shared policy: In Sync
    0079134988264     NK-DELHI-PA         Shared policy: In Sync
    0079151765883     NK-CHENNAI-PA       Shared policy: In Sync`,q:{en:`What is the lesson?`,hi:`Lesson kya hai?`},o:[{en:`Negate never applies to new firewalls`,hi:`Negate naye firewalls par kabhi lagu nahi hota`},{en:`Negate covers every member except the listed ones, including firewalls added later, so review targeted rules and prefer groups for permanent differences`,hi:`Negate listed ko chhodkar har member ko cover karta hai, baad mein add hue firewalls ko bhi, isliye targeted rules review karo aur permanent differences ke liye groups prefer karo`},{en:`Targets are disabled after a quarter`,hi:`Targets ek quarter baad disabled ho jaate hain`},{en:`Only post-rules support negate`,hi:`Sirf post-rules negate support karti hain`}],a:1,w:{en:`A negate rule goes to everyone except the listed firewalls. Chennai was never listed, so it receives the rule. Use a child group or an explicit target list when the exception is permanent, and audit targeted rules after onboarding.`,hi:`Negate rule listed firewalls ke alawa sabko jati hai. Chennai kabhi listed nahi tha, isliye use rule milti hai. Exception permanent ho to child group ya explicit target list use karo, aur onboarding ke baad targeted rules audit karo.`}}];export{e as default};