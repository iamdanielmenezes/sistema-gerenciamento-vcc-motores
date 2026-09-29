package VCCMotores.Sistema_de_gerenciamento;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import VCCMotores.Sistema_de_gerenciamento.entities.Budget;
import VCCMotores.Sistema_de_gerenciamento.entities.Payment;
import VCCMotores.Sistema_de_gerenciamento.entities.enums.PaymentMethod;
import VCCMotores.Sistema_de_gerenciamento.entities.enums.PaymentStatus;
import VCCMotores.Sistema_de_gerenciamento.services.PaymentService;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.BusinessException;

@SpringBootTest
class PaymentServiceTests {

    @Autowired
    private PaymentService paymentService;

    @Test
    void findByIdShouldReturnPaymentWhenIdExists() { //Testa se o método findById retorna o pagamento corretamente quando o ID existe.

        Payment payment = paymentService.findById(1L);

        assertNotNull(payment);
        assertEquals(PaymentStatus.PAGO, payment.getStatus());
    }
    
    @Test
    void shouldNotCreatePaymentWhenBudgetIsNotApproved() { //Testa se o sistema impede realizar um pagamento quando o orçamento ainda não foi aprovado.

        Budget budget = new Budget();
        budget.setId(5L);

        Payment payment = new Payment();
        payment.setBudget(budget);
        payment.setMethod(PaymentMethod.PIX);
        payment.setStatus(PaymentStatus.PENDENTE);

        assertThrows(BusinessException.class, () -> {
            paymentService.insert(payment);
        });
    }
}
