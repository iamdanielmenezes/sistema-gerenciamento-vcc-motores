package VCCMotores.Sistema_de_gerenciamento;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import VCCMotores.Sistema_de_gerenciamento.entities.Budget;
import VCCMotores.Sistema_de_gerenciamento.entities.Maintenance;
import VCCMotores.Sistema_de_gerenciamento.entities.enums.BudgetStatus;
import VCCMotores.Sistema_de_gerenciamento.services.BudgetService;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.BusinessException;

@SpringBootTest
class BudgetServiceTests {

    @Autowired
    private BudgetService budgetService;

    @Test
    void findByIdShouldReturnBudgetWhenIdExists() { //Testa se o método findById retorna o orçamento corretamente quando o ID existe.

        Budget budget = budgetService.findById(5L);

        assertNotNull(budget);
        assertEquals(BudgetStatus.AGUARDANDO_APROVACAO, budget.getStatus());
    }
    
    @Test
    void shouldNotCreateDuplicateActiveBudget() { //Testa se o sistema impede criar um novo orçamento ativo para uma manutenção que já possui um.

        Maintenance maintenance = new Maintenance();
        maintenance.setId(7L);

        Budget budget = new Budget();
        budget.setPrice(new BigDecimal("1000"));
        budget.setMaintenance(List.of(maintenance));

        assertThrows(BusinessException.class, () -> {
            budgetService.insert(budget);
        });
    }
}
